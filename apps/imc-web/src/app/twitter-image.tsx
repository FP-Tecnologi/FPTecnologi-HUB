import { ImageResponse } from "next/og";

// Imagen para compartir (WhatsApp, redes, buscadores): se genera aquí con el logo, sin fotos externas.
export const alt = "Company IMC E.I.R.L. — Soluciones tecnológicas para el crecimiento empresarial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 90px", background: "linear-gradient(135deg,#172e5e 0%,#0056aa 100%)", color: "#fff", fontFamily: "sans-serif" }}>
        <svg width="190" height="283" viewBox="0 0 58.96 87.8">
          <path fill="#ffaa07" d="M58.96,21.32l-16.26,3.18c-2.32-5.18-6.87-8.7-12.09-8.7-7.57,0-13.7,7.39-13.7,16.51s6.13,16.51,13.7,16.51c1.27,0,2.5-.21,3.66-.6l-.2.92.07,15.86c-1.22.16-2.46.24-3.72.24C13.62,65.24,0,50.64,0,32.62S13.62,0,30.42,0c13.1,0,24.25,8.87,28.54,21.32Z" />
          <rect fill="#ffaa07" x="37.83" y="30.66" width="18.16" height="57.14" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1 }}>Company IMC</div>
          <div style={{ fontSize: 36, marginTop: 28, color: "#fde3b4", maxWidth: 760, lineHeight: 1.25 }}>Soluciones tecnológicas para el crecimiento empresarial</div>
          <div style={{ fontSize: 28, marginTop: 34, color: "#ffaa07" }}>companyimc.com · Perú Compras</div>
        </div>
      </div>
    ),
    size,
  );
}
