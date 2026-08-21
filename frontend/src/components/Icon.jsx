const glyphs = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  plus: <><path d="M12 5v14M5 12h14" /></>,
  message: (
    <>
      <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.5V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  logOut: (
    <>
      <path d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9" />
    </>
  ),
  car: (
    <>
      <path d="m5 11 1.5-4h11L19 11l1.5 1.5V18h-2v-2H5v2H3.5v-5.5Z" />
      <path d="M7 11h10M7 13.5h.01M17 13.5h.01" />
    </>
  ),
  home: <><path d="m4 11 8-7 8 7v9H4Z" /><path d="M9 20v-5h6v5" /></>,
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  heart: <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.4h.8a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6 9.7 7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
  flag: <path d="M5 21V4m0 1h12l-2 4 2 4H5" />,
  shield: <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6Z" />,
  chart: (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 3-4 3 2 5-6" />
    </>
  ),
  imagePlus: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="1.5" />
      <path d="m3 17 5-5 4 4 2-2 7 6M17 7v5M14.5 9.5h5" />
    </>
  ),
  package: (
    <>
      <path d="m4 7 8-4 8 4v10l-8 4-8-4Z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </>
  ),
};

export function Icon({ name, size = 20, strokeWidth = 1.9, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`ui-icon ${className}`.trim()}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      width={size}
    >
      {glyphs[name] || glyphs.package}
    </svg>
  );
}
