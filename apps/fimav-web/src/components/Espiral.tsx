// Coordenadas en el espacio del logo (viewBox recortado a la espiral).
export default function Espiral({ className = '', contorno = false }: { className?: string; contorno?: boolean }) {
  const id = contorno ? 'e-c' : 'e-r';
  return (
    <svg viewBox="38 168 744 744" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-plata`} gradientUnits="userSpaceOnUse" x1="145" y1="0" x2="782" y2="0">
          <stop offset="0" stopColor="#6f7d87" />
          <stop offset="0.28" stopColor="#b4bcc2" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="0.78" stopColor="#aeb6bc" />
          <stop offset="1" stopColor="#66767f" />
        </linearGradient>
        <clipPath id={`${id}-disco`}><circle cx="410" cy="540" r="372" /></clipPath>
      </defs>
      {contorno ? (
        <g fill="none" stroke="#e02424" strokeWidth="6">
          <circle cx="410" cy="540" r="369" />
          <circle cx="410" cy="541" r="162" />
          <path d="M590 440A220 220 0 0 0 370 220M780 580A300 300 0 0 1 300 665" />
        </g>
      ) : (
        <g>
          <circle cx="410" cy="540" r="372" fill="#e02424" />
          <circle cx="463" cy="594" r="318" fill={`url(#${id}-plata)`} clipPath={`url(#${id}-disco)`} />
          <path d="M410 168A372 372 0 0 1 780 580A300 300 0 0 1 300 665L560 500L590 440A220 220 0 0 0 370 220Z" fill="#c02020" clipPath={`url(#${id}-disco)`} />
          <circle cx="410" cy="541" r="162" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
