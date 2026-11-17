// The sheet stores light Tailwind classes ("bg-blue-100", "text-red-600") made
// for a white page. On the dark theme we keep the hue but use the bright 400
// shade. Keep this list in sync with the safelist in globals.css.
export const SHEET_COLORS = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "gray",
] as const;

const SHEET_CLASS = new RegExp(`^(?:bg|text)-(${SHEET_COLORS.join("|")})-\\d{2,3}$`);

export type NeonTone = { text: string; glow: string };

export function neonTone(sheetClass: string | undefined): NeonTone {
  const color = sheetClass?.trim().match(SHEET_CLASS)?.[1];
  if (!color) return { text: "text-hk-magenta", glow: "glow-hk-magenta" };
  return { text: `text-${color}-400`, glow: `glow-${color}-400` };
}
