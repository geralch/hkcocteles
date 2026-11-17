import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import WhatsAppButton from "@/components/WhatsAppButton";

// Shapes echoing the logo's triangles, bolts and dots.
function Decorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="absolute top-10 left-[6%] w-10 text-hk-orange neon-glow rotate-12" viewBox="0 0 40 40">
        <path d="M4 34 L20 6 L36 34 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <svg className="absolute bottom-12 right-[8%] w-8 text-hk-yellow neon-glow" viewBox="0 0 24 40">
        <path d="M14 2 L2 22 H11 L8 38 L22 14 H13 Z" fill="currentColor" />
      </svg>
      <div className="absolute top-1/3 right-[45%] w-6 h-6 rounded-full border-[4px] border-hk-cyan shadow-[0_0_12px_var(--color-hk-cyan)]" />
      <div className="absolute bottom-20 left-[12%] w-5 h-5 rounded-full bg-hk-magenta shadow-[0_0_14px_var(--color-hk-magenta)]" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklab,var(--color-hk-purple)_22%,transparent),transparent_60%)]">
      <Decorations />
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <p className="inline-block rounded-full border-2 border-hk-yellow text-hk-yellow px-4 py-1 font-display font-bold text-sm shadow-[0_0_14px_-4px_var(--color-hk-yellow)] -rotate-2">
            📍 {site.address.neighborhood} · {site.address.city}
          </p>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Cócteles <span className="text-hk-orange neon-text flicker">granizados</span> con y sin{" "}
            <span className="text-hk-magenta neon-text">licor</span>
          </h1>
          <p className="mt-5 text-lg text-fg/80 max-w-md mx-auto md:mx-0">
            Frescos, coloridos y con toppings para todos los gustos. Ven a HK o pide el tuyo por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/menu" className="btn glow-hk-orange px-6 py-3 text-lg">
              Ver menú
            </Link>
            <WhatsAppButton className="px-6 py-3 text-lg" />
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <Image
            src="/img/logo.webp"
            alt={`Logo de ${site.name}`}
            width={1469}
            height={1847}
            priority
            sizes="(min-width: 768px) 448px, 256px"
            className="w-64 md:w-full max-w-md h-auto drop-shadow-[0_0_30px_color-mix(in_oklab,var(--color-hk-magenta)_55%,transparent)]"
          />
        </div>
      </div>
    </section>
  );
}
