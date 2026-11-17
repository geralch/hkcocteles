// Photos shown in the landing page gallery, in order. Put the image in
// public/img/gallery/ and add a line here; `href` is optional and links the
// photo to its Instagram post. Photos are shown as tall 9:16 tiles.
// These are the reel covers from @hkcocteles; swap in sharper exports from
// the phone under the same file names whenever you like.
export type GalleryPhoto = { file: string; alt: string; href?: string };

const reel = (id: string) => `https://www.instagram.com/hkcocteles/reel/${id}/`;

export const gallery: GalleryPhoto[] = [
  { file: "ig-01.jpg", alt: "Granizado HK con gomitas: ¿ves lo bonito? Ahora imagínate lo rico", href: reel("Dfsye6Ohkh_") },
  { file: "ig-02.jpg", alt: "Granizado de mango explosivo", href: reel("DfsUewZBWyS") },
  { file: "ig-03.jpg", alt: "Granizados de mandarina", href: reel("DfsQ41Pud29") },
  { file: "ig-04.jpg", alt: "Granizado BomBomBum con chicle de sandía, gomitas Aro y chupeta corazón", href: reel("De8OxMTt9rs") },
  { file: "ig-05.jpg", alt: "Bolitas explosivas", href: reel("De5nvWjtC43") },
  { file: "ig-06.jpg", alt: "Granizados con gomitas: un granizado no pasa de moda", href: reel("De5Zjl3tWZX") },
  { file: "ig-07.jpg", alt: "Fantasma con gafas sosteniendo un granizado HK con gomitas", href: reel("De2V9gIBL0I") },
  { file: "ig-08.jpg", alt: "Promo: granizado azul HK con gomitas", href: reel("Dez2Rt_Jm5v") },
  { file: "ig-09.jpg", alt: "Granizados HK de Halloween con calabazas", href: reel("DesJJ_FRsBU") },
  { file: "ig-10.jpg", alt: "Granizado HK cubierto de gomitas", href: reel("DeqQxIbNaJ7") },
  { file: "ig-11.jpg", alt: "Granizado de maracumango", href: reel("DeqJrlptolZ") },
  { file: "ig-12.jpg", alt: "Limonada de coco", href: reel("DVZCXIxAGPk") },
];
