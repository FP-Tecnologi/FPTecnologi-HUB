import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["/", "/nosotros/", "/servicios/", "/productos/", "/peru-compras/", "/contacto/"];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === "/" ? "weekly" : "monthly", priority: r === "/" ? 1 : r === "/contacto/" ? 0.6 : 0.8 }));
}
