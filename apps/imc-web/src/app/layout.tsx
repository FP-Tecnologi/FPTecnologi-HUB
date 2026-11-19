import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import Cortina from "@/components/Cortina";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: { default: "Company IMC E.I.R.L. | Soluciones tecnológicas para el crecimiento empresarial", template: "%s | Company IMC" },
  description:
    "Equipos de cómputo, impresión, networking, servidores, software, cableado estructurado y centrales telefónicas. Proveedor en Perú Compras con más de 4 años de experiencia.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>
        <noscript><style>{`.cortina{display:none!important}.rev{opacity:1!important;transform:none!important}`}</style></noscript>
        <Cortina />
        <Cabecera />
        <main>{children}</main>
        <Pie />
      </body>
    </html>
  );
}
