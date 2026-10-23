type Props = {
  className?: string;
  src?: string;
  alt?: string;
};

export default function Logo({ className = 'h-12 w-auto', src = '/brand/logo.png', alt = 'Fimav Perú' }: Props) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
