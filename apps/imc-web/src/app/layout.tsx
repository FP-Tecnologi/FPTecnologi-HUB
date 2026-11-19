import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Company IMC E.I.R.L. | Soluciones tecnológicas para el crecimiento empresarial",
  description:
    "Equipos de cómputo, impresión, networking, servidores, software, cableado estructurado y centrales telefónicas. Proveedor en Perú Compras con más de 4 años de experiencia.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
