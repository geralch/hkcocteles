import Link from "next/link";
import Image from "next/image";

// Type definitions
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
  size: string;
  price: string;
}

interface Subsection {
  title: string;
  items: MenuItem[];
}

interface MenuSection {
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

// Menu data structure
const menuData: MenuData = {
  especiales: {
    title: "Granizados Especiales",
    icon: "🍹",
    color: "text-red-600",
    active: true,
    subsections: [
      {
        title: "Con Licor (16 Oz)",
        items: [
          {
            id: 1,
            name: "Baileys",
            description: "Cremoso y delicioso",
            price: "$22.000",
            emoji: "🍹",
            bgColor: "bg-gray-200",
            image: "/img/sabores/baileys.png",
            active: true
          },
          {
            id: 2,
            name: "Piña Colada (Ron)",
            description: "Tropical y refrescante",
            price: "$22.000",
            emoji: "🥥",
            bgColor: "bg-gray-200",
            image: "/img/sabores/pina_colada.png",
            active: true
          },
          {
            id: 3,
            name: "Mango Viche (Tequila)",
            description: "Dulce y picante",
            price: "$22.000",
            emoji: "🥭",
            bgColor: "bg-gray-200",
            image: "/img/sabores/mango_viche.png",
            active: true
          },
          {
            id: 4,
            name: "Lulo (Vodka)",
            description: "Ácido y refrescante",
            price: "$22.000",
            emoji: "🍋",
            bgColor: "bg-gray-200",
            image: "/img/sabores/lulo.png",
            active: true
          }
        ]
      },
      {
        title: "Sin Licor (16 Oz)",
        items: [
          {
            id: 5,
            name: "Piña Colada",
            description: "Tropical y refrescante",
            price: "$20.000",
            emoji: "🥥",
            bgColor: "bg-blue-100",
            image: "/img/sabores/pina_colada.png",
            active: true
          },
          {
            id: 6,
            name: "Mango Viche",
            description: "Dulce y picante",
            price: "$20.000",
            emoji: "🥭",
            bgColor: "bg-orange-100",
            image: "/img/sabores/mango_viche.png",
            active: true
          },
          {
            id: 7,
            name: "Lulo",
            description: "Ácido y refrescante",
            price: "$20.000",
            emoji: "🍋",
            bgColor: "bg-yellow-100",
            image: "/img/sabores/lulo.png",
            active: true
          }
        ]
      }
    ]
  },
  sinLicor: {
    title: "Granizados sin Licor",
    icon: "🧊",
    color: "text-blue-600",
    active: true,
    sizes: [
      { size: "8 Onz", price: "$8.000" },
      { size: "12 Onz", price: "$12.000" },
      { size: "16 Onz", price: "$16.000" },
      { size: "24 Onz", price: "$20.000" }
    ],
    items: [
      {
        id: 1,
        name: "Mora Azul",
        description: "Dulce y refrescante",
        emoji: "🫐",
        bgColor: "bg-blue-100",
        image: "/img/sabores/mora_azul.png",
        active: true
      },
      {
        id: 2,
        name: "Maracuyá Mango",
        description: "Tropical y ácido",
        emoji: "🥭",
        bgColor: "bg-orange-100",
        image: "/img/sabores/maracu_mango.png",
        active: true
      },
      {
        id: 3,
        name: "Bombom Bum",
        description: "Dulce y cremoso",
        emoji: "🍬",
        bgColor: "bg-red-100",
        image: "/img/sabores/bombombum.png",
        active: true
      },
      {
        id: 4,
        name: "Limonada Sandía",
        description: "Refrescante y dulce",
        emoji: "🍉",
        bgColor: "bg-pink-100",
        image: "/img/sabores/sandia.png",
        active: true
      }
    ]
  },
  conLicor: {
    title: "Granizados con Licor",
    icon: "🍸",
    color: "text-green-600",
    active: true,
    sizes: [
      { size: "8 Onz", price: "$10.000" },
      { size: "12 Onz", price: "$14.000" },
      { size: "16 Onz", price: "$18.000" },
      { size: "24 Onz", price: "$25.000" }
    ],
    items: [
      {
        id: 1,
        name: "Mora Azul",
        description: "Dulce y refrescante",
        emoji: "🫐",
        bgColor: "bg-blue-100",
        image: "/img/sabores/mora_azul.png",
        active: true
      },
      {
        id: 2,
        name: "Maracuyá Mango",
        description: "Tropical y ácido",
        emoji: "🥭",
        bgColor: "bg-orange-100",
        image: "/img/sabores/maracu_mango.png",
        active: true
      },
      {
        id: 3,
        name: "Bombom Bum",
        description: "Dulce y cremoso",
        emoji: "🍬",
        bgColor: "bg-red-100",
        image: "/img/sabores/bombombum.png",
        active: true
      },
      {
        id: 4,
        name: "Limonada Sandía",
        description: "Refrescante y dulce",
        emoji: "🍉",
        bgColor: "bg-pink-100",
        image: "/img/sabores/sandia.png",
        active: true
      }
    ]
  },
  extras: {
    title: "Extras",
    icon: "✨",
    color: "text-purple-600",
    active: true,
    items: [
      {
        id: 1,
        name: "Bolas Explosivas",
        description: "Sabores: Maracuyá, Lulo, Cereza",
        price: "$2.000",
        emoji: "💥",
        bgColor: "bg-purple-100",
        image: "/img/extras/perlas.png",
        active: true
      },
      {
        id: 2,
        name: "Micheladas Sal/Azúcar",
        description: "Sabores: Mango, Fantasy",
        price: "$1.000",
        emoji: "🍺",
        bgColor: "bg-yellow-100",
        image: "/img/extras/michelado.png",
        active: true
      }
    ]
  },
  toppings: {
    title: "Toppings",
    icon: "🍭",
    color: "text-pink-600",
    active: true,
    items: [
      {
        id: 1,
        name: "Gusanito",
        price: "$200",
        emoji: "🐛",
        bgColor: "bg-pink-100",
        image: "/img/toppings/gusanito.png",
        active: true
      },
      {
        id: 2,
        name: "Aro",
        price: "$200",
        emoji: "🍩",
        bgColor: "bg-pink-100",
        image: "/img/toppings/aro.png",
        active: true
      },
      {
        id: 3,
        name: "Chicle Miniatura",
        price: "$200",
        emoji: "🍬",
        bgColor: "bg-pink-100",
        image: "/img/toppings/mini_chicles.png",
        active: true
      },
      {
        id: 4,
        name: "Bombombum",
        price: "$500",
        emoji: "💣",
        bgColor: "bg-pink-100",
        image: "/img/toppings/bombombum.png",
        active: true
      },
      {
        id: 5,
        name: "Cinta",
        price: "$300",
        emoji: "🎀",
        bgColor: "bg-pink-100",
        image: "/img/toppings/cinta.png",
        active: true
      },
      {
        id: 6,
        name: "Tipitin",
        price: "$300",
        emoji: "🍭",
        bgColor: "bg-pink-100",
        image: "/img/toppings/tipitin.png",
        active: true
      }
    ]
  },
  gaseosas: {
    title: "Gaseosas",
    icon: "🥤",
    color: "text-orange-600",
    active: false,
    items: [
      {
        id: 1,
        name: "Coca Cola",
        description: "350ml",
        price: "$3.500",
        emoji: "🥤",
        bgColor: "bg-red-100",
        active: true
      },
      {
        id: 2,
        name: "Sprite",
        description: "350ml",
        price: "$3.500",
        emoji: "🥤",
        bgColor: "bg-green-100",
        active: true
      },
      {
        id: 3,
        name: "Fanta",
        description: "350ml",
        price: "$3.500",
        emoji: "🥤",
        bgColor: "bg-orange-100",
        active: false
      }
    ]
  },
  cervezas: {
    title: "Cervezas",
    icon: "🍺",
    color: "text-yellow-600",
    active: false,
    items: [
      {
        id: 1,
        name: "Aguila",
        description: "330ml",
        price: "$4.500",
        emoji: "🍺",
        bgColor: "bg-yellow-100",
        active: true
      },
      {
        id: 2,
        name: "Club Colombia",
        description: "330ml",
        price: "$5.000",
        emoji: "🍺",
        bgColor: "bg-yellow-100",
        active: true
      },
      {
        id: 3,
        name: "Corona",
        description: "355ml",
        price: "$6.000",
        emoji: "🍺",
        bgColor: "bg-yellow-100",
        active: false
      }
    ]
  }
};

// Component for rendering menu items
const MenuItem = ({ item }: { item: MenuItem }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`w-16 h-16 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={64}
          height={64}
          className="object-contain w-full h-full"
        />
      ) : (
        <span className="text-2xl">{item.emoji}</span>
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-black text-lg mb-2 text-gray-800">{item.name}</h3>
      {item.description && <p className="text-gray-600 mb-2">{item.description}</p>}
      {item.price && <p className="text-xl font-bold text-green-600">{item.price}</p>}
    </div>
  </div>
);

// Component for rendering topping items (smaller layout)
const ToppingItem = ({ item }: { item: MenuItem }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}>
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
      <h3 className="font-black text-lg mb-1 text-gray-800">{item.name}</h3>
      <p className="text-green-600 font-bold">{item.price}</p>
    </div>
  </div>
);

// Component for rendering sections with sizes
const SectionWithSizes = ({ section }: { section: MenuSection }) => {
  // Don't render the section if it's inactive
  if (!section.active) return null;
  
  if (!section.items) return null;
  
  const activeItems = section.items.filter((item: MenuItem) => item.active);
  
  // Don't render the section if no active items
  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`text-2xl font-black ${section.color} mb-6 flex items-center gap-3`}>
          <span className="text-3xl">{section.icon}</span>
          {section.title}
        </h2>
        {section.sizes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tamaños Disponibles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {section.sizes.map((size: Size, index: number) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-800">{size.size}</p>
                  <p className="text-green-600 font-bold">{size.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${activeItems.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          {activeItems.map((item: MenuItem) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Component for rendering sections with subsections
const SectionWithSubsections = ({ section }: { section: MenuSection }) => {
  // Don't render the section if it's inactive
  if (!section.active) return null;
  
  if (!section.subsections) return null;

  const activeSubsections = section.subsections.filter(subsection => 
    subsection.items.some(item => item.active)
  );

  if (activeSubsections.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`text-2xl font-black ${section.color} mb-6 flex items-center gap-3`}>
          <span className="text-3xl">{section.icon}</span>
          {section.title}
        </h2>
        {activeSubsections.map((subsection, index) => {
          const activeItems = subsection.items.filter(item => item.active);
          if (activeItems.length === 0) return null;

          return (
            <div key={index} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                {subsection.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeItems.map((item: MenuItem) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Component for rendering regular sections
const RegularSection = ({ section }: { section: MenuSection }) => {
  // Don't render the section if it's inactive
  if (!section.active) return null;
  
  if (!section.items) return null;
  
  const activeItems = section.items.filter((item: MenuItem) => item.active);
  
  // Don't render the section if no active items
  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`text-2xl font-black ${section.color} mb-6 flex items-center gap-3`}>
          <span className="text-3xl">{section.icon}</span>
          {section.title}
        </h2>
        <div className={`grid grid-cols-1 ${section.title === 'Toppings' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {activeItems.map((item: MenuItem) => (
            section.title === 'Toppings' ? (
              <ToppingItem key={item.id} item={item} />
            ) : (
              <MenuItem key={item.id} item={item} />
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Menu() {
  return (
    <div className="font-nunito min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/img/logo.webp"
              alt="HK Cocteles Logo"
              width={50}
              height={50}
              priority
            />
            <span className="text-xl font-bold text-white">HK Cocteles</span>
          </Link>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Inicio
          </Link>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">MENÚ</h1>
          <p className="text-gray-300">Deliciosos granizados y bebidas para todos los gustos</p>
        </div>

        {/* Dynamic Menu Sections */}
        <SectionWithSizes section={menuData.sinLicor} />
        <SectionWithSizes section={menuData.conLicor} />
        <RegularSection section={menuData.extras} />
        <RegularSection section={menuData.toppings} />
        <SectionWithSubsections section={menuData.especiales} /> 
        <RegularSection section={menuData.gaseosas} />
        <RegularSection section={menuData.cervezas} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Calle 28 # 24A - 106 - Prados de Oriente - Cali</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>3180318210</span>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="flex gap-4">
                <a href="https://facebook.com/hkcocteles" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/hkcocteles" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com/@hkcocteles" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}