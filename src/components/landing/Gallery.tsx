import Image from "next/image";
import { site } from "@/content/site";
import { gallery } from "@/content/gallery";
import { SocialIcon } from "@/components/SocialIcons";

// Tiles cycle through the logo colors.
const GLOWS = ["glow-hk-magenta", "glow-hk-cyan", "glow-hk-mint", "glow-hk-orange", "glow-hk-yellow", "glow-hk-purple"];

const PLACEHOLDER_EMOJI = ["🍹", "🧊", "🍸", "🍭", "✨", "🥤"];

export default function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-20 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-4xl font-extrabold text-center text-hk-magenta neon-text">Galería</h2>
        <p className="mt-2 text-center text-fg/70">Así se vive HK</p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {gallery.length > 0
            ? gallery.map((photo, index) => {
                const image = (
                  <Image
                    src={`/img/gallery/${encodeURIComponent(photo.file)}`}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                );
                const tile = `neon ${GLOWS[index % GLOWS.length]} relative block aspect-[9/16] overflow-hidden bg-black`;
                return photo.href ? (
                  <a
                    key={photo.file}
                    href={photo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${tile} group transition-transform hover:-translate-y-1`}
                  >
                    {image}
                    <span
                      aria-hidden="true"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-night/70 text-fg flex items-center justify-center text-xs group-hover:bg-(--glow) group-hover:text-night transition-colors"
                    >
                      ▶
                    </span>
                  </a>
                ) : (
                  <div key={photo.file} className={tile}>
                    {image}
                  </div>
                );
              })
            : PLACEHOLDER_EMOJI.map((emoji, index) => (
                <div
                  key={emoji}
                  aria-hidden="true"
                  className={`neon ${GLOWS[index]} aspect-[9/16] flex items-center justify-center text-5xl`}
                >
                  {emoji}
                </div>
              ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn glow-hk-magenta px-6 py-3 text-lg"
          >
            <SocialIcon name="instagram" className="w-5 h-5" />
            Síguenos en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
