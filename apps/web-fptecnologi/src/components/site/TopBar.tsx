const CONTACT = {
  phoneVentas: '+51 970 614 881',
  phoneVentasWeb: '+51 908 856 286',
  email: 'ventasweb@fptecnologi.com',
  address: 'Jr. Huaraz 1841, Breña — Lima, Perú',
};

export function TopBar() {
  return (
    <div className="hidden bg-brand-primary text-xs text-white/80 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-brand-teal-light">
              <path
                d="M6.6 10.2c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C9.6 20 4 14.4 4 7.5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            {CONTACT.phoneVentas}
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-brand-teal-light">
              <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {CONTACT.email}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80">{CONTACT.address}</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="font-medium text-white">Distribuidor autorizado multi-marca</span>
        </div>
      </div>
    </div>
  );
}
