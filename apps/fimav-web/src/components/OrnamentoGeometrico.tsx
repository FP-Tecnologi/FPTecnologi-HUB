type Props = { className?: string };

export default function OrnamentoGeometrico({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className={className}>
      <circle cx="160" cy="160" r="132" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M160 18 282 88v144l-122 70-122-70V88Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="82" fill="none" stroke="#e02424" strokeWidth="1.5" />
    </svg>
  );
}
