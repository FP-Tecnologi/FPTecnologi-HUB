const PATHS: Record<string, string> = {
  shield: 'M12 3l7 3v6c0 4.4-3 8.3-7 9-4-.7-7-4.6-7-9V6l7-3Z',
  academic: 'M12 4 2 9l10 5 8-4v6M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5',
  server: 'M4 5h16v6H4zM4 13h16v6H4zM7 8h.01M7 16h.01',
  building: 'M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9h5a1 1 0 0 1 1 1v11M8 7h.01M8 11h.01M8 15h.01',
  video: 'M4 6h11v12H4zM15 10l5-3v10l-5-3',
  database: 'M12 5c4.4 0 8-1.1 8-2.5S16.4 0 12 0 4 1.1 4 2.5 7.6 5 12 5Zm0 5c4.4 0 8-1.1 8-2.5M4 7.5C4 8.9 7.6 10 12 10m-8-2.5V17c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V7.5',
  'cloud-upload': 'M7 18a4 4 0 0 1-1-7.9A5.5 5.5 0 0 1 16.9 9 4.5 4.5 0 0 1 17 18H7ZM12 17v-5m0 0-2.5 2.5M12 12l2.5 2.5',
  cloud: 'M7 18a4 4 0 0 1-1-7.9A5.5 5.5 0 0 1 16.9 9 4.5 4.5 0 0 1 17 18H7Z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z',
  network: 'M12 3v5m0 0H5v5m7-5h7v5M3 15h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3m-4 4v2',
  key: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d={PATHS[name] ?? PATHS.shield} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
