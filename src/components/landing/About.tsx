import { site } from "@/content/site";

export default function About() {
  return (
    <section id="nosotros" className="scroll-mt-20 py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-extrabold">
          Somos <span className="text-hk-cyan neon-text">HK</span>
        </h2>
        <div className="mt-6 space-y-4 text-lg text-fg/80">
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
