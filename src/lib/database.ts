import Database from 'better-sqlite3';
import path from 'path';

// Database file path
const dbPath = path.join(process.cwd(), 'menu.db');

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export function initializeDatabase() {
  // Sections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sizes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL,
      size TEXT NOT NULL,
      price TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_key) REFERENCES sections(key) ON DELETE CASCADE
    )
  `);

  // Subsections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subsections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_key) REFERENCES sections(key) ON DELETE CASCADE
    )
  `);

  // Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT,
      subsection_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT,
      emoji TEXT NOT NULL,
      bg_color TEXT NOT NULL,
      image TEXT,
      active BOOLEAN NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_key) REFERENCES sections(key) ON DELETE CASCADE,
      FOREIGN KEY (subsection_id) REFERENCES subsections(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_section ON items(section_key);
    CREATE INDEX IF NOT EXISTS idx_items_subsection ON items(subsection_id);
    CREATE INDEX IF NOT EXISTS idx_sizes_section ON sizes(section_key);
    CREATE INDEX IF NOT EXISTS idx_subsections_section ON subsections(section_key);
  `);
}

// Initialize database on import
initializeDatabase();

// Prepared statements for better performance
const stmt = {
  // Sections
  getSections: db.prepare('SELECT * FROM sections ORDER BY id'),
  getSection: db.prepare('SELECT * FROM sections WHERE key = ?'),
  updateSection: db.prepare(`
    UPDATE sections 
    SET title = ?, icon = ?, color = ?, active = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE key = ?
  `),
  insertSection: db.prepare(`
    INSERT INTO sections (key, title, icon, color, active) 
    VALUES (?, ?, ?, ?, ?)
  `),

  // Sizes
  getSizes: db.prepare('SELECT * FROM sizes WHERE section_key = ? ORDER BY id'),
  updateSize: db.prepare(`
    UPDATE sizes 
    SET size = ?, price = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  insertSize: db.prepare(`
    INSERT INTO sizes (section_key, size, price) 
    VALUES (?, ?, ?)
  `),
  deleteSize: db.prepare('DELETE FROM sizes WHERE id = ?'),

  // Subsections
  getSubsections: db.prepare('SELECT * FROM subsections WHERE section_key = ? ORDER BY order_index'),
  updateSubsection: db.prepare(`
    UPDATE subsections 
    SET title = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  insertSubsection: db.prepare(`
    INSERT INTO subsections (section_key, title, order_index) 
    VALUES (?, ?, ?)
  `),
  deleteSubsection: db.prepare('DELETE FROM subsections WHERE id = ?'),

  // Items
  getItems: db.prepare('SELECT * FROM items WHERE section_key = ? AND subsection_id IS NULL ORDER BY order_index'),
  getItemsBySubsection: db.prepare('SELECT * FROM items WHERE subsection_id = ? ORDER BY order_index'),
  updateItem: db.prepare(`
    UPDATE items 
    SET name = ?, description = ?, price = ?, emoji = ?, bg_color = ?, 
        image = ?, active = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  insertItem: db.prepare(`
    INSERT INTO items (section_key, subsection_id, name, description, price, emoji, bg_color, image, active, order_index) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  deleteItem: db.prepare('DELETE FROM items WHERE id = ?'),
};

// Database operations
export const dbOperations = {
  // Sections
  getAllSections: () => stmt.getSections.all(),
  getSection: (key: string) => stmt.getSection.get(key),
  updateSection: (key: string, title: string, icon: string, color: string, active: boolean) => {
    return stmt.updateSection.run(title, icon, color, active ? 1 : 0, key);
  },
  insertSection: (key: string, title: string, icon: string, color: string, active: boolean) => {
    return stmt.insertSection.run(key, title, icon, color, active ? 1 : 0);
  },

  // Sizes
  getSizes: (sectionKey: string) => stmt.getSizes.all(sectionKey),
  updateSize: (id: number, size: string, price: string) => {
    return stmt.updateSize.run(size, price, id);
  },
  insertSize: (sectionKey: string, size: string, price: string) => {
    return stmt.insertSize.run(sectionKey, size, price);
  },
  deleteSize: (id: number) => stmt.deleteSize.run(id),

  // Subsections
  getSubsections: (sectionKey: string) => stmt.getSubsections.all(sectionKey),
  updateSubsection: (id: number, title: string, orderIndex: number) => {
    return stmt.updateSubsection.run(title, orderIndex, id);
  },
  insertSubsection: (sectionKey: string, title: string, orderIndex: number) => {
    return stmt.insertSubsection.run(sectionKey, title, orderIndex);
  },
  deleteSubsection: (id: number) => stmt.deleteSubsection.run(id),

  // Items
  getItems: (sectionKey: string) => stmt.getItems.all(sectionKey),
  getItemsBySubsection: (subsectionId: number) => stmt.getItemsBySubsection.all(subsectionId),
  updateItem: (id: number, name: string, description: string | null, price: string | null, 
               emoji: string, bgColor: string, image: string | null, active: boolean, orderIndex: number) => {
    return stmt.updateItem.run(name, description, price, emoji, bgColor, image, active ? 1 : 0, orderIndex, id);
  },
  insertItem: (sectionKey: string | null, subsectionId: number | null, name: string, 
               description: string | null, price: string | null, emoji: string, bgColor: string, 
               image: string | null, active: boolean, orderIndex: number) => {
    return stmt.insertItem.run(sectionKey, subsectionId, name, description, price, emoji, bgColor, image, active ? 1 : 0, orderIndex);
  },
  deleteItem: (id: number) => stmt.deleteItem.run(id),
};

// Seed initial data
export function seedDatabase() {
  // Check if data already exists
  const existingSections = stmt.getSections.all();
  if (existingSections.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database with initial data...');

  // Insert sections
  const sections = [
    { key: 'especiales', title: 'Granizados Especiales', icon: '🍹', color: 'text-red-600', active: true },
    { key: 'sinLicor', title: 'Granizados sin Licor', icon: '🧊', color: 'text-blue-600', active: true },
    { key: 'conLicor', title: 'Granizados con Licor', icon: '🍸', color: 'text-green-600', active: true },
    { key: 'extras', title: 'Extras', icon: '✨', color: 'text-purple-600', active: true },
    { key: 'toppings', title: 'Toppings', icon: '🍭', color: 'text-pink-600', active: true },
    { key: 'gaseosas', title: 'Gaseosas', icon: '🥤', color: 'text-orange-600', active: false },
    { key: 'cervezas', title: 'Cervezas', icon: '🍺', color: 'text-yellow-600', active: false },
  ];

  sections.forEach(section => {
    stmt.insertSection.run(section.key, section.title, section.icon, section.color, section.active ? 1 : 0);
  });

  // Insert sizes for sinLicor and conLicor
  const sizes = [
    { sectionKey: 'sinLicor', size: '8 Onz', price: '$8.000' },
    { sectionKey: 'sinLicor', size: '12 Onz', price: '$12.000' },
    { sectionKey: 'sinLicor', size: '16 Onz', price: '$16.000' },
    { sectionKey: 'sinLicor', size: '24 Onz', price: '$20.000' },
    { sectionKey: 'conLicor', size: '8 Onz', price: '$10.000' },
    { sectionKey: 'conLicor', size: '12 Onz', price: '$14.000' },
    { sectionKey: 'conLicor', size: '16 Onz', price: '$18.000' },
    { sectionKey: 'conLicor', size: '24 Onz', price: '$25.000' },
  ];

  sizes.forEach(size => {
    stmt.insertSize.run(size.sectionKey, size.size, size.price);
  });

  // Insert subsections for especiales
  const subsections = [
    { sectionKey: 'especiales', title: 'Con Licor (16 Oz)', orderIndex: 0 },
    { sectionKey: 'especiales', title: 'Sin Licor (16 Oz)', orderIndex: 1 },
  ];

  subsections.forEach(subsection => {
    stmt.insertSubsection.run(subsection.sectionKey, subsection.title, subsection.orderIndex);
  });

  // Insert items
  const items = [
    // Especiales - Con Licor
    { sectionKey: null, subsectionId: 1, name: 'Baileys', description: 'Cremoso y delicioso', price: '$22.000', emoji: '🍹', bgColor: 'bg-gray-200', image: '/img/sabores/baileys.png', active: true, orderIndex: 0 },
    { sectionKey: null, subsectionId: 1, name: 'Piña Colada (Ron)', description: 'Tropical y refrescante', price: '$22.000', emoji: '🥥', bgColor: 'bg-gray-200', image: '/img/sabores/pina_colada.png', active: true, orderIndex: 1 },
    { sectionKey: null, subsectionId: 1, name: 'Mango Viche (Tequila)', description: 'Dulce y picante', price: '$22.000', emoji: '🥭', bgColor: 'bg-gray-200', image: '/img/sabores/mango_viche.png', active: true, orderIndex: 2 },
    { sectionKey: null, subsectionId: 1, name: 'Lulo (Vodka)', description: 'Ácido y refrescante', price: '$22.000', emoji: '🍋', bgColor: 'bg-gray-200', image: '/img/sabores/lulo.png', active: true, orderIndex: 3 },
    
    // Especiales - Sin Licor
    { sectionKey: null, subsectionId: 2, name: 'Piña Colada', description: 'Tropical y refrescante', price: '$20.000', emoji: '🥥', bgColor: 'bg-blue-100', image: '/img/sabores/pina_colada.png', active: true, orderIndex: 0 },
    { sectionKey: null, subsectionId: 2, name: 'Mango Viche', description: 'Dulce y picante', price: '$20.000', emoji: '🥭', bgColor: 'bg-orange-100', image: '/img/sabores/mango_viche.png', active: true, orderIndex: 1 },
    { sectionKey: null, subsectionId: 2, name: 'Lulo', description: 'Ácido y refrescante', price: '$20.000', emoji: '🍋', bgColor: 'bg-yellow-100', image: '/img/sabores/lulo.png', active: true, orderIndex: 2 },

    // Sin Licor
    { sectionKey: 'sinLicor', subsectionId: null, name: 'Mora Azul', description: 'Dulce y refrescante', price: null, emoji: '🫐', bgColor: 'bg-blue-100', image: '/img/sabores/mora_azul.png', active: true, orderIndex: 0 },
    { sectionKey: 'sinLicor', subsectionId: null, name: 'Maracuyá Mango', description: 'Tropical y ácido', price: null, emoji: '🥭', bgColor: 'bg-orange-100', image: '/img/sabores/maracu_mango.png', active: true, orderIndex: 1 },
    { sectionKey: 'sinLicor', subsectionId: null, name: 'BombomBum', description: 'Dulce y cremoso', price: null, emoji: '🍬', bgColor: 'bg-red-100', image: '/img/sabores/bombombum.png', active: true, orderIndex: 2 },
    { sectionKey: 'sinLicor', subsectionId: null, name: 'Limonada Sandía', description: 'Refrescante y dulce', price: null, emoji: '🍉', bgColor: 'bg-pink-100', image: '/img/sabores/sandia.png', active: true, orderIndex: 3 },

    // Con Licor
    { sectionKey: 'conLicor', subsectionId: null, name: 'Mora Azul', description: 'Dulce y refrescante', price: null, emoji: '🫐', bgColor: 'bg-blue-100', image: '/img/sabores/mora_azul.png', active: true, orderIndex: 0 },
    { sectionKey: 'conLicor', subsectionId: null, name: 'Maracuyá Mango', description: 'Tropical y ácido', price: null, emoji: '🥭', bgColor: 'bg-orange-100', image: '/img/sabores/maracu_mango.png', active: true, orderIndex: 1 },
    { sectionKey: 'conLicor', subsectionId: null, name: 'BombomBum', description: 'Dulce y cremoso', price: null, emoji: '🍬', bgColor: 'bg-red-100', image: '/img/sabores/bombombum.png', active: true, orderIndex: 2 },
    { sectionKey: 'conLicor', subsectionId: null, name: 'Limonada Sandía', description: 'Refrescante y dulce', price: null, emoji: '🍉', bgColor: 'bg-pink-100', image: '/img/sabores/sandia.png', active: true, orderIndex: 3 },

    // Extras
    { sectionKey: 'extras', subsectionId: null, name: 'Bolas Explosivas', description: 'Sabores: Maracuyá, Lulo, Cereza', price: '$2.000', emoji: '💥', bgColor: 'bg-purple-100', image: '/img/extras/perlas.png', active: true, orderIndex: 0 },
    { sectionKey: 'extras', subsectionId: null, name: 'Micheladas Sal/Azúcar', description: 'Sabores: Mango, Fantasy', price: '$1.000', emoji: '🍺', bgColor: 'bg-yellow-100', image: '/img/extras/michelado.png', active: true, orderIndex: 1 },

    // Toppings
    { sectionKey: 'toppings', subsectionId: null, name: 'Gusanito', description: null, price: '$200', emoji: '🐛', bgColor: 'bg-pink-100', image: '/img/toppings/gusanito.png', active: true, orderIndex: 0 },
    { sectionKey: 'toppings', subsectionId: null, name: 'Aro', description: null, price: '$200', emoji: '🍩', bgColor: 'bg-pink-100', image: '/img/toppings/aro.png', active: true, orderIndex: 1 },
    { sectionKey: 'toppings', subsectionId: null, name: 'Chicle Miniatura', description: null, price: '$200', emoji: '🍬', bgColor: 'bg-pink-100', image: '/img/toppings/mini_chicles.png', active: true, orderIndex: 2 },
    { sectionKey: 'toppings', subsectionId: null, name: 'Bombombum', description: null, price: '$500', emoji: '💣', bgColor: 'bg-pink-100', image: '/img/toppings/bombombum.png', active: true, orderIndex: 3 },
    { sectionKey: 'toppings', subsectionId: null, name: 'Cinta', description: null, price: '$300', emoji: '🎀', bgColor: 'bg-pink-100', image: '/img/toppings/cinta.png', active: true, orderIndex: 4 },
    { sectionKey: 'toppings', subsectionId: null, name: 'Tipitin', description: null, price: '$300', emoji: '🍭', bgColor: 'bg-pink-100', image: '/img/toppings/tipitin.png', active: true, orderIndex: 5 },

    // Gaseosas
    { sectionKey: 'gaseosas', subsectionId: null, name: 'Coca Cola', description: '350ml', price: '$3.500', emoji: '🥤', bgColor: 'bg-red-100', image: null, active: true, orderIndex: 0 },
    { sectionKey: 'gaseosas', subsectionId: null, name: 'Sprite', description: '350ml', price: '$3.500', emoji: '🥤', bgColor: 'bg-green-100', image: null, active: true, orderIndex: 1 },

    // Cervezas
    { sectionKey: 'cervezas', subsectionId: null, name: 'Aguila', description: '330ml', price: '$4.500', emoji: '🍺', bgColor: 'bg-yellow-100', image: null, active: true, orderIndex: 0 },
    { sectionKey: 'cervezas', subsectionId: null, name: 'Club Colombia', description: '330ml', price: '$5.000', emoji: '🍺', bgColor: 'bg-yellow-100', image: null, active: true, orderIndex: 1 },
    { sectionKey: 'cervezas', subsectionId: null, name: 'Corona', description: '355ml', price: '$6.000', emoji: '🍺', bgColor: 'bg-yellow-100', image: null, active: false, orderIndex: 2 },
  ];

  items.forEach(item => {
    stmt.insertItem.run(
      item.sectionKey, 
      item.subsectionId, 
      item.name, 
      item.description, 
      item.price, 
      item.emoji, 
      item.bgColor, 
      item.image, 
      item.active ? 1 : 0, 
      item.orderIndex
    );
  });

  console.log('Database seeded successfully');
}

// Seed database on import
seedDatabase();

export default db;
