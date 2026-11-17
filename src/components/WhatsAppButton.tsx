import { site } from "@/content/site";
import { whatsappUrl } from "@/lib/links";
import { SocialIcon } from "./SocialIcons";

export default function WhatsAppButton({
  label = "Pide por WhatsApp",
  className = "px-6 py-3",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappUrl(site.whatsapp, site.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn glow-whatsapp ${className}`}
    >
      <SocialIcon name="whatsapp" className="w-5 h-5" />
      {label}
    </a>
  );
}
