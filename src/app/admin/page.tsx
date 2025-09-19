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

    try {
      const response = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (response.ok) {
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
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Update size function
  const updateSize = async (sectionKey: string, sizeIndex: number, field: keyof Size, value: string) => {
    const section = menuData[sectionKey];
    if (!section.sizes) return;

    const size = section.sizes[sizeIndex];
    const updatedSize = { ...size, [field]: value };

    try {
      const response = await fetch(`/api/menu/sizes/${size.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSize),
      });

      if (response.ok) {
        setMenuData(prev => {
          const newData = { ...prev };
          const section = newData[sectionKey];
          
          if (section.sizes) {
            section.sizes[sizeIndex] = updatedSize;
          }
          
          return newData;
        });
        setHasChanges(true);
      } else {
        console.error('Failed to update size');
      }
    } catch (error) {
      console.error('Error updating size:', error);
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Section */}
              {section.items && (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Items</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {section.items.map((item, index) => (
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
                              className="w-full text-lg font-black text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                                  className="w-full text-lg font-black text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
