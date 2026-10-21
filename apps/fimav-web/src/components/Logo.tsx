export default function Logo({ className = 'h-12 w-auto' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/logo.png" alt="Fimav Perú" className={className} />;
}
