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
    <header className="sticky top-0 z-30 h-16 bg-cream/95 backdrop-blur border-b-[3px] border-ink">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/img/logo.webp" alt={site.name} width={40} height={50} priority className="h-12 w-auto" />
          <span className="font-display text-xl font-extrabold hidden sm:inline">{site.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-display font-bold">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-hk-orange-ink transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/menu" className="btn px-4 py-1.5 text-sm bg-hk-orange md:hidden">
            Menú
          </Link>
          <WhatsAppButton label="WhatsApp" className="px-4 py-1.5 text-sm" />
        </div>
      </div>
    </header>
  );
}
