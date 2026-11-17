import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getMenu } from "@/lib/menu";
import type { MenuItem, MenuSection } from "@/lib/menu-data";
import { neonTone } from "@/lib/neon";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menú",
  description: "Granizados con y sin licor, especiales, sodas, extras y toppings de HK Cocteles en Cali.",
};

const ITEM_GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

// Toppings use a smaller card without description.
const ItemCard = ({ item, compact }: { item: MenuItem; compact: boolean }) => (
  <div className={`neon ${neonTone(item.bgColor).glow} p-3 flex items-center gap-4`}>
    <div
      className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-xl border-2 border-(--glow) bg-[color-mix(in_oklab,var(--glow)_15%,transparent)] flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className="object-contain w-full h-full"
        />
      ) : (
        <span className={compact ? "text-xl" : "text-2xl"}>{item.emoji}</span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-display text-lg font-bold leading-tight">{item.name}</h4>
      {!compact && item.description && <p className="text-sm text-fg/70">{item.description}</p>}
      {item.price && <p className="font-display font-bold text-hk-yellow">{item.price}</p>}
    </div>
  </div>
);

const SectionTabs = ({ sections }: { sections: MenuSection[] }) => (
  <nav aria-label="Secciones del menú" className="sticky top-16 z-20 bg-night/85 backdrop-blur border-b border-fg/10">
    <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
      {sections.map((section) => (
        <a
          key={section.key}
          href={`#${section.key}`}
          className="shrink-0 rounded-full border-2 border-hk-cyan/60 px-4 py-1.5 font-display text-sm font-bold hover:border-hk-cyan hover:text-hk-cyan hover:shadow-[0_0_12px_-2px_var(--color-hk-cyan)] transition"
        >
          {section.icon} {section.title}
        </a>
      ))}
    </div>
  </nav>
);

const MenuSectionBlock = ({ section }: { section: MenuSection }) => {
  const compact = section.key === "toppings";
  const tone = neonTone(section.color);

  return (
    <section id={section.key} className={`scroll-mt-32 neon ${tone.glow} bg-panel/60 p-5 md:p-8`}>
      <h2 className={`font-display text-3xl font-extrabold ${tone.text} neon-text mb-6 flex items-center gap-3`}>
        <span>{section.icon}</span>
        {section.title}
      </h2>
      <div className="space-y-8">
        {section.sizes.length > 0 && (
          <div>
            <h3 className="font-display text-lg font-bold mb-3">Tamaños disponibles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {section.sizes.map((size, index) => (
                <div key={index} className="text-center rounded-xl border-2 border-hk-yellow/70 bg-hk-yellow/10 p-3">
                  <p className="font-bold">{size.size}</p>
                  <p className="font-display font-bold text-hk-yellow">{size.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {section.items.length > 0 && (
          <div className={ITEM_GRID}>
            {section.items.map((item) => (
              <ItemCard key={item.id} item={item} compact={compact} />
            ))}
          </div>
        )}
        {section.subsections.map((subsection) => (
          <div key={subsection.title}>
            <h3 className="font-display text-xl font-bold mb-4 border-b-2 border-dashed border-fg/20 pb-2">
              {subsection.title}
            </h3>
            <div className={ITEM_GRID}>
              {subsection.items.map((item) => (
                <ItemCard key={item.id} item={item} compact={compact} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default async function MenuPage() {
  let sections: MenuSection[] = [];
  try {
    sections = await getMenu();
  } catch (error) {
    console.error("Failed to load menu from Google Sheets", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {sections.length > 0 && <SectionTabs sections={sections} />}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-extrabold text-hk-magenta neon-text flicker">Menú</h1>
          <p className="mt-2 text-fg/70">Granizados con y sin licor para todos los gustos</p>
        </div>
        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((section) => (
              <MenuSectionBlock key={section.key} section={section} />
            ))}
          </div>
        ) : (
          <div className="neon p-8 text-center max-w-md mx-auto">
            <p className="font-display text-2xl font-bold mb-2">Menú no disponible 😅</p>
            <p className="mb-6 text-fg/70">
              Estamos actualizando el menú. Escríbenos por WhatsApp y te contamos qué hay hoy.
            </p>
            <WhatsAppButton />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
