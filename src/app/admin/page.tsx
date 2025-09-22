'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";

// Type definitions (same as menu page)
interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price?: string;
  emoji: string;
  bgColor: string;
  image?: string;
  active: boolean;
}

interface Size {
  id: number;
  size: string;
  price: string;
}

interface Subsection {
  id: number;
  title: string;
  items: MenuItem[];
}

interface MenuSection {
  id: number;
  title: string;
  icon: string;
  color: string;
  sizes?: Size[];
  items?: MenuItem[];
  subsections?: Subsection[];
  active: boolean;
}

interface MenuData {
  [key: string]: MenuSection;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [menuData, setMenuData] = useState<MenuData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSection, setNewSection] = useState({ key: '', title: '', icon: '✨', color: 'text-gray-600', active: true });
  const [newItemBySection, setNewItemBySection] = useState<Record<string, { name: string; price?: string; description?: string }>>({});
  const [newSizeBySection, setNewSizeBySection] = useState<Record<string, { size: string; price: string }>>({});

  // Fetch menu data from API
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuData(data);
      } else {
        console.error('Failed to fetch menu data');
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password - you can change this
      setIsAuthenticated(true);
      setPassword('');
      fetchMenuData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setMenuData({});
    setHasChanges(false);
  };

  // Update item function
  const updateItem = async (sectionKey: string, subsectionIndex: number | null, itemIndex: number, field: keyof MenuItem, value: string | boolean) => {
    const section = menuData[sectionKey];
    let item: MenuItem | null = null;

    if (subsectionIndex !== null && section.subsections) {
      item = section.subsections[subsectionIndex].items[itemIndex];
    } else if (section.items) {
      item = section.items[itemIndex];
    }

    if (!item) return;

    const updatedItem = { ...item, [field]: value };

    // Update local state immediately for better UX
    setMenuData(prev => {
      const newData = { ...prev };
      const section = newData[sectionKey];
      
      if (subsectionIndex !== null && section.subsections) {
        section.subsections[subsectionIndex].items[itemIndex] = updatedItem;
      } else if (section.items) {
        section.items[itemIndex] = updatedItem;
      }
      
      return newData;
    });
    setHasChanges(true);

    // Then update the server
    try {
      const response = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        console.error('Failed to update item');
        // Revert on error
        setMenuData(prev => {
          const newData = { ...prev };
          const section = newData[sectionKey];
          
          if (subsectionIndex !== null && section.subsections) {
            section.subsections[subsectionIndex].items[itemIndex] = item!;
          } else if (section.items) {
            section.items[itemIndex] = item!;
          }
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert on error
      setMenuData(prev => {
        const newData = { ...prev };
        const section = newData[sectionKey];
        
        if (subsectionIndex !== null && section.subsections) {
          section.subsections[subsectionIndex].items[itemIndex] = item!;
        } else if (section.items) {
          section.items[itemIndex] = item!;
        }
        
        return newData;
      });
    }
  };

  // Update size function
  const updateSize = async (sectionKey: string, sizeIndex: number, field: keyof Size, value: string) => {
    const section = menuData[sectionKey];
    if (!section.sizes) return;

    const size = section.sizes[sizeIndex];
    const updatedSize = { ...size, [field]: value };

    // Update local state immediately for better UX
    setMenuData(prev => {
      const newData = { ...prev };
      const section = newData[sectionKey];
      
      if (section.sizes) {
        section.sizes[sizeIndex] = updatedSize;
      }
      
      return newData;
    });
    setHasChanges(true);

    // Then update the server
    try {
      const response = await fetch(`/api/menu/sizes/${size.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSize),
      });

      if (!response.ok) {
        console.error('Failed to update size');
        // Revert on error
        setMenuData(prev => {
          const newData = { ...prev };
          const section = newData[sectionKey];
          
          if (section.sizes) {
            section.sizes[sizeIndex] = size;
          }
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error updating size:', error);
      // Revert on error
      setMenuData(prev => {
        const newData = { ...prev };
        const section = newData[sectionKey];
        
        if (section.sizes) {
          section.sizes[sizeIndex] = size;
        }
        
        return newData;
      });
    }
  };

  // Update section active status
  const updateSectionActive = async (sectionKey: string, active: boolean) => {
    const section = menuData[sectionKey];
    const updatedSection = { ...section, active };

    try {
      const response = await fetch(`/api/menu/sections/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSection),
      });

      if (response.ok) {
        setMenuData(prev => {
          const newData = { ...prev };
          newData[sectionKey].active = active;
          return newData;
        });
        setHasChanges(true);
      } else {
        console.error('Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  // Save changes (refresh data from server)
  const saveChanges = async () => {
    await fetchMenuData();
    setHasChanges(false);
    alert('Cambios guardados exitosamente');
  };

  // Create section
  const addSection = async () => {
    try {
      if (!newSection.key || !newSection.title) {
        alert('Ingresa clave y título de la sección');
        return;
      }
      const res = await fetch('/api/menu/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`No se pudo crear la sección${err.error ? `: ${err.error}` : ''}`);
        return;
      }
      const data = await res.json();
      setMenuData(prev => ({
        ...prev,
        [newSection.key]: {
          id: data.id,
          title: newSection.title,
          icon: newSection.icon,
          color: newSection.color,
          active: newSection.active,
          sizes: undefined,
          items: undefined,
          subsections: prev[newSection.key]?.subsections,
        },
      }));
      setNewSection({ key: '', title: '', icon: '✨', color: 'text-gray-600', active: true });
      setHasChanges(true);
    } catch (e) {
      console.error(e);
      alert('Error creando la sección');
    }
  };

  // Create item under a section (not subsection)
  const addItem = async (sectionKey: string) => {
    const payload = newItemBySection[sectionKey] || { name: '' };
    try {
      if (!payload.name) {
        alert('Ingresa el nombre del item');
        return;
      }
      const res = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          name: payload.name,
          description: payload.description ?? null,
          price: payload.price ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`No se pudo crear el item${err.error ? `: ${err.error}` : ''}`);
        return;
      }
      const data = await res.json();
      setMenuData(prev => {
        const newData = { ...prev };
        const section = newData[sectionKey];
        const items = section.items ? [...section.items] : [];
        items.push({
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          emoji: data.emoji ?? '✨',
          bgColor: data.bgColor ?? 'bg-gray-200',
          image: data.image ?? null,
          active: Boolean(data.active ?? true),
        });
        newData[sectionKey] = { ...section, items };
        return newData;
      });
      setNewItemBySection(prev => ({ ...prev, [sectionKey]: { name: '', price: '', description: '' } }));
      setHasChanges(true);
    } catch (e) {
      console.error(e);
      alert('Error creando el item');
    }
  };

  // Create size under a section
  const addSize = async (sectionKey: string) => {
    const payload = newSizeBySection[sectionKey] || { size: '', price: '' };
    try {
      if (!payload.size || !payload.price) {
        alert('Ingresa tamaño y precio');
        return;
      }
      const res = await fetch('/api/menu/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey, size: payload.size, price: payload.price }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`No se pudo crear el tamaño${err.error ? `: ${err.error}` : ''}`);
        return;
      }
      const data = await res.json();
      setMenuData(prev => {
        const newData = { ...prev };
        const section = newData[sectionKey];
        const sizes = section.sizes ? [...section.sizes] : [];
        sizes.push({ id: data.id, size: data.size, price: data.price });
        newData[sectionKey] = { ...section, sizes };
        return newData;
      });
      setNewSizeBySection(prev => ({ ...prev, [sectionKey]: { size: '', price: '' } }));
      setHasChanges(true);
    } catch (e) {
      console.error(e);
      alert('Error creando el tamaño');
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-gray-800 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Ingresa la contraseña para acceder</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ingresar
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/menu" className="text-blue-600 hover:underline">
              ← Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/img/logo.webp"
              alt="HK Cocteles Logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-xl font-black text-white">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-4">
            {hasChanges && (
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Guardar Cambios
              </button>
            )}
            <Link 
              href="/menu" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Menú
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 mb-2">Gestión del Menú</h1>
          <p className="text-gray-600">Edita precios, disponibilidad y configuración de secciones</p>
        </div>

        {/* Create Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">Agregar Nueva Sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Clave (key)"
              value={newSection.key}
              onChange={(e) => setNewSection(s => ({ ...s, key: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Título"
              value={newSection.title}
              onChange={(e) => setNewSection(s => ({ ...s, title: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Icono (emoji)"
              value={newSection.icon}
              onChange={(e) => setNewSection(s => ({ ...s, icon: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Color de texto (Tailwind)"
              value={newSection.color}
              onChange={(e) => setNewSection(s => ({ ...s, color: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={addSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Agregar Sección
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando datos del menú...</p>
          </div>
        )}

        {/* Menu Sections */}
        <div className="space-y-8">
          {Object.entries(menuData).map(([sectionKey, section]) => (
            <div key={sectionKey} className="bg-white rounded-lg shadow-lg p-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-black ${section.color} flex items-center gap-3`}>
                  <span className="text-3xl">{section.icon}</span>
                  {section.title}
                </h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={section.active}
                      onChange={(e) => updateSectionActive(sectionKey, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Sección Activa</span>
                  </label>
                </div>
              </div>

              {/* Sizes Section */}
              {section.sizes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Tamaños y Precios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section.sizes.map((size, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tamaño
                          </label>
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) => updateSize(sectionKey, index, 'size', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio
                          </label>
                          <input
                            type="text"
                            value={size.price}
                            onChange={(e) => updateSize(sectionKey, index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Add Size */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nuevo tamaño"
                      value={newSizeBySection[sectionKey]?.size || ''}
                      onChange={(e) => setNewSizeBySection(prev => ({ ...prev, [sectionKey]: { size: e.target.value, price: prev[sectionKey]?.price || '' } }))}
                      className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <input
                      type="text"
                      placeholder="Precio"
                      value={newSizeBySection[sectionKey]?.price || ''}
                      onChange={(e) => setNewSizeBySection(prev => ({ ...prev, [sectionKey]: { size: prev[sectionKey]?.size || '', price: e.target.value } }))}
                      className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <button
                      onClick={() => addSize(sectionKey)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Agregar Tamaño
                    </button>
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">Items</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(section.items || []).map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <span className="text-xl">{item.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(sectionKey, null, index, 'name', e.target.value)}
                              className="w-full text-lg font-black text-gray-800 bg-white border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded px-2 py-1"
                            />
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.active}
                              onChange={(e) => updateItem(sectionKey, null, index, 'active', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Activo</span>
                          </label>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => updateItem(sectionKey, null, index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                          </div>
                          {item.price && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio
                              </label>
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => updateItem(sectionKey, null, index, 'price', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {/* Add Item */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre del item"
                    value={newItemBySection[sectionKey]?.name || ''}
                    onChange={(e) => setNewItemBySection(prev => ({ ...prev, [sectionKey]: { name: e.target.value, price: prev[sectionKey]?.price || '', description: prev[sectionKey]?.description || '' } }))}
                    className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Precio (opcional)"
                    value={newItemBySection[sectionKey]?.price || ''}
                    onChange={(e) => setNewItemBySection(prev => ({ ...prev, [sectionKey]: { name: prev[sectionKey]?.name || '', price: e.target.value, description: prev[sectionKey]?.description || '' } }))}
                    className="px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    onClick={() => addItem(sectionKey)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Agregar Item
                  </button>
                </div>
              </div>

              {/* Subsections */}
              {section.subsections && (
                <div>
                  {section.subsections.map((subsection, subsectionIndex) => (
                    <div key={subsectionIndex} className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                        {subsection.title}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {subsection.items.map((item, itemIndex) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="object-contain w-full h-full"
                                  />
                                ) : (
                                  <span className="text-xl">{item.emoji}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateItem(sectionKey, subsectionIndex, itemIndex, 'name', e.target.value)}
                                  className="w-full text-lg font-black text-gray-800 bg-white border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded px-2 py-1"
                                />
                              </div>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.active}
                                  onChange={(e) => updateItem(sectionKey, subsectionIndex, itemIndex, 'active', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Activo</span>
                              </label>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Descripción
                                </label>
                                <input
                                  type="text"
                                  value={item.description || ''}
                                  onChange={(e) => updateItem(sectionKey, subsectionIndex, itemIndex, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                              </div>
                              {item.price && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio
                                  </label>
                                  <input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) => updateItem(sectionKey, subsectionIndex, itemIndex, 'price', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
