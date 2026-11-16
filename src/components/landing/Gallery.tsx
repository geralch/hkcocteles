import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { site } from "@/content/site";
import { SocialIcon } from "@/components/SocialIcons";

// Drop photos into public/img/gallery/ and they show up here, sorted by filename.
const GALLERY_DIR = path.join(process.cwd(), "public", "img", "gallery");
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

const PLACEHOLDERS = [
  { color: "bg-hk-orange", emoji: "🍹" },
  { color: "bg-hk-magenta", emoji: "🧊" },
  { color: "bg-hk-mint", emoji: "🍸" },
  { color: "bg-hk-cyan", emoji: "🍭" },
  { color: "bg-hk-yellow", emoji: "✨" },
  { color: "bg-hk-purple", emoji: "🥤" },
];

function galleryPhotos(): string[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((file) => IMAGE_FILE.test(file))
    .sort()
    .map((file) => `/img/gallery/${encodeURIComponent(file)}`);
}

export default function Gallery() {
  const photos = galleryPhotos();

  return (
    <section id="galeria" className="scroll-mt-20 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-4xl font-extrabold text-center">Galería</h2>
        <p className="mt-2 text-center text-ink/70">Así se vive HK</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {photos.length > 0
            ? photos.map((src, index) => (
                <div
                  key={src}
                  className={`sticker relative aspect-square overflow-hidden ${index % 2 ? "rotate-1" : "-rotate-1"}`}
                >
                  <Image
                    src={src}
                    alt={`Foto ${index + 1} de ${site.name}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))
            : PLACEHOLDERS.map((tile, index) => (
                <div
                  key={tile.color}
                  aria-hidden="true"
                  className={`sticker aspect-square ${tile.color} flex items-center justify-center text-5xl ${index % 2 ? "rotate-1" : "-rotate-1"}`}
                >
                  {tile.emoji}
                </div>
              ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-6 py-3 text-lg bg-hk-magenta"
          >
            <SocialIcon name="instagram" className="w-5 h-5" />
            Síguenos en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
