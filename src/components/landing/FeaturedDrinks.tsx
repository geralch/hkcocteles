import Image from "next/image";
import Link from "next/link";
import { getFeaturedDrinks } from "@/lib/menu";
import type { FeaturedDrink } from "@/lib/menu-data";
import { neonTone } from "@/lib/neon";

export default async function FeaturedDrinks() {
  let drinks: FeaturedDrink[];
  try {
    drinks = await getFeaturedDrinks();
  } catch (error) {
    // The rest of the landing page still works without the sheet.
    console.error("Failed to load featured drinks", error);
    return null;
  }
  if (drinks.length === 0) return null;

  return (
    <section className="border-y border-hk-mint/30 bg-hk-mint/5 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-4xl font-extrabold text-center text-hk-mint neon-text">Los favoritos de la casa</h2>
        <p className="mt-2 text-center text-fg/70">Sabores que vuelan cada día</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {drinks.map((drink) => (
            <div key={drink.id} className={`neon ${neonTone(drink.bgColor).glow} p-4 text-center`}>
              <div className="rounded-xl bg-[radial-gradient(circle,color-mix(in_oklab,var(--glow)_25%,transparent),transparent_70%)] aspect-square flex items-center justify-center overflow-hidden">
                <Image src={drink.image} alt={drink.name} width={240} height={240} className="object-contain w-4/5 h-4/5" />
              </div>
              <h3 className="mt-3 font-display text-xl font-bold leading-tight">{drink.name}</h3>
              {drink.description && <p className="text-sm text-fg/70">{drink.description}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/menu" className="btn glow-hk-orange px-6 py-3 text-lg">
            Ver menú completo
          </Link>
        </div>
      </div>
    </section>
  );
}
