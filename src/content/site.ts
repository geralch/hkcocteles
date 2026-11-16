// Business info shown across the site. Edit it here; every page reads from it.
// The hours and the "about" text are drafts: replace them with the real ones.
export const site = {
  name: "HK Cocteles",
  url: "https://hkcocteles.com",
  tagline: "Cócteles granizados con y sin licor",
  description:
    "Granizados con y sin licor, sodas y toppings en Prados de Oriente, Cali. Ven por el tuyo o pídelo por WhatsApp.",
  about: [
    "En HK Cocteles convertimos el antojo en fiesta: granizados preparados al momento, con y sin licor, llenos de color y sabor.",
    "Desde Prados de Oriente, en Cali, mezclamos frutas, siropes y toppings para que cada vaso sea único. Ven con tus amigos, arma tu combinación favorita o pídela por WhatsApp.",
  ],
  address: {
    street: "Calle 28 # 24A - 106",
    neighborhood: "Prados de Oriente",
    city: "Cali",
    region: "Valle del Cauca",
    country: "CO",
  },
  mapsQuery: "Calle 28 # 24A-106, Prados de Oriente, Cali, Colombia",
  phone: "3180318210",
  whatsapp: "573180318210",
  whatsappMessage: "¡Hola HK! Quiero hacer un pedido 🍹",
  // Menu section keys that featured drinks come from, in menu order.
  featuredSections: ["sinLicor", "conLicor", "especiales"],
  // `schema` uses schema.org openingHours format for Google.
  hours: [
    { days: "Lunes a jueves", time: "3:00 pm – 10:00 pm", schema: "Mo-Th 15:00-22:00" },
    { days: "Viernes y sábado", time: "3:00 pm – 12:00 am", schema: "Fr-Sa 15:00-23:59" },
    { days: "Domingos y festivos", time: "2:00 pm – 9:00 pm", schema: "Su 14:00-21:00" },
  ],
  social: {
    instagram: "https://instagram.com/hkcocteles",
    facebook: "https://facebook.com/hkcocteles",
    tiktok: "https://tiktok.com/@hkcocteles",
  },
} as const;

export const fullAddress = `${site.address.street} - ${site.address.neighborhood} - ${site.address.city}`;
