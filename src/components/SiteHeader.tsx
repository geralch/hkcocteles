import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import WhatsAppButton from "./WhatsAppButton";

const NAV = [
  { href: "/menu", label: "Menú" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/#galeria", label: "Galería" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-night/85 backdrop-blur border-b border-hk-magenta/50 shadow-[0_0_24px_-8px_var(--color-hk-magenta)]">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/img/logo.webp" alt={site.name} width={40} height={50} priority className="h-12 w-auto drop-shadow-[0_0_8px_var(--color-hk-magenta)]" />
          <span className="font-display text-xl font-extrabold text-hk-magenta neon-text hidden sm:inline">{site.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-display font-bold">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-hk-cyan hover:neon-text transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/menu" className="btn glow-hk-orange px-4 py-1.5 text-sm md:hidden">
            Menú
          </Link>
          <WhatsAppButton label="WhatsApp" className="px-4 py-1.5 text-sm" />
        </div>
      </div>
    </header>
  );
}
