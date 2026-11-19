import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import Cortina from "@/components/Cortina";
import JsonLd from "@/components/JsonLd";
import { SITIO, organizacion, sitioWeb } from "@/lib/seo";
import Whatsapp from "@/components/Whatsapp";
import { getEmpresa } from "@/lib/cms";

// En cada visita (no prerenderizado): lo guardado en el dashboard se ve sin recompilar y sin depender de HUB_MARCA_ID al compilar.
export const dynamic = "force-dynamic";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  alternates: { canonical: "/", languages: { "es-PE": "/" } },
  openGraph: { siteName: "Company IMC", locale: "es_PE", type: "website", url: "/" },
  twitter: { card: "summary_large_image" },
  title: { default: "Company IMC E.I.R.L. | Soluciones tecnológicas para el crecimiento empresarial", template: "%s | Company IMC" },
  description:
    "Equipos de cómputo, impresión, networking, servidores, software, cableado estructurado y centrales telefónicas. Proveedor en Perú Compras con más de 4 años de experiencia.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const empresa = await getEmpresa();
  return (
    <html lang="es" className={poppins.variable}>
      <body>
        <noscript><style>{`.cortina{display:none!important}.rev{opacity:1!important;transform:none!important}`}</style></noscript>
        <JsonLd datos={[organizacion, sitioWeb]} />
        <Cortina />
        <Cabecera empresa={empresa} />
        <main>{children}</main>
        <Pie empresa={empresa} />
        <Whatsapp empresa={empresa} />
      </body>
    </html>
  );
}
