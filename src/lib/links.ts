export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Plain embed URL: works without a Google Maps API key.
export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
