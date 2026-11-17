import { site } from "@/content/site";

// Structured data so Google can show the address, hours and phone.
export default function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}/img/logo.webp`,
    telephone: `+57${site.phone}`,
    servesCuisine: "Cócteles granizados",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    openingHours: site.hours.flatMap((hours) => ("schema" in hours ? [hours.schema] : [])),
    sameAs: Object.values(site.social),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
