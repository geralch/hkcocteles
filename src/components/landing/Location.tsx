import { fullAddress, site } from "@/content/site";
import { mapsEmbedUrl, mapsSearchUrl } from "@/lib/links";

export default function Location() {
  return (
    <section id="ubicacion" className="scroll-mt-20 py-16 border-y border-hk-cyan/30 bg-hk-cyan/5">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        <div className="neon glow-hk-cyan p-6 md:p-8">
          <h2 className="font-display text-4xl font-extrabold text-hk-cyan neon-text">Visítanos</h2>
          <p className="mt-4 text-lg">📍 {fullAddress}</p>
          <h3 className="mt-6 font-display text-xl font-bold">Horario</h3>
          <dl className="mt-2 divide-y-2 divide-dashed divide-fg/15">
            {site.hours.map((hours) => (
              <div key={hours.days} className="flex justify-between gap-4 py-2">
                <dt>{hours.days}</dt>
                <dd className="font-bold text-right">{hours.time}</dd>
              </div>
            ))}
          </dl>
          <a
            href={mapsSearchUrl(site.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn glow-hk-yellow mt-6 px-6 py-3"
          >
            Cómo llegar
          </a>
        </div>
        <div className="neon glow-hk-cyan overflow-hidden min-h-80">
          <iframe
            title={`Mapa de ${site.name}`}
            src={mapsEmbedUrl(site.mapsQuery)}
            className="w-full h-full min-h-80 dark-map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
