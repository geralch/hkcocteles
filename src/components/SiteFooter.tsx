import { fullAddress, site } from "@/content/site";
import { SocialLinks } from "./SocialIcons";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-hk-orange">{site.name}</p>
          <p className="mt-1 text-cream/80">{site.tagline}</p>
        </div>
        <div className="space-y-1">
          <p>📍 {fullAddress}</p>
          <p>
            📞{" "}
            <a href={`tel:+57${site.phone}`} className="hover:underline">
              {site.phone}
            </a>
          </p>
          {site.hours.map((hours) => (
            <p key={hours.days} className="text-sm text-cream/70">
              {hours.days}: {hours.time}
            </p>
          ))}
        </div>
        <SocialLinks className="md:justify-end" />
      </div>
      <p className="text-center text-xs text-cream/50 pb-6">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
