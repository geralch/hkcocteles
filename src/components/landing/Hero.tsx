import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import WhatsAppButton from "@/components/WhatsAppButton";

// Shapes echoing the logo's triangles, bolts and dots.
function Decorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="absolute top-10 left-[6%] w-10 text-hk-orange rotate-12" viewBox="0 0 40 40">
        <path d="M4 34 L20 6 L36 34 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <svg className="absolute bottom-12 right-[8%] w-8 text-hk-yellow stroke-ink" viewBox="0 0 24 40">
        <path d="M14 2 L2 22 H11 L8 38 L22 14 H13 Z" fill="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-1/3 right-[45%] w-6 h-6 rounded-full border-[5px] border-hk-cyan" />
      <div className="absolute bottom-20 left-[12%] w-5 h-5 rounded-full bg-hk-magenta border-2 border-ink" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Decorations />
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <p className="inline-block sticker bg-hk-yellow px-4 py-1 font-display font-bold text-sm -rotate-2">
            📍 {site.address.neighborhood} · {site.address.city}
          </p>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Cócteles <span className="text-hk-orange-ink">granizados</span> con y sin{" "}
            <span className="text-hk-purple">licor</span>
          </h1>
          <p className="mt-5 text-lg text-ink/80 max-w-md mx-auto md:mx-0">
            Frescos, coloridos y con toppings para todos los gustos. Ven a HK o pide el tuyo por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/menu" className="btn px-6 py-3 text-lg bg-hk-orange">
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
            className="w-64 md:w-full max-w-md h-auto"
          />
        </div>
      </div>
    </section>
  );
}
