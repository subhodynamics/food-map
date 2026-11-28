export function OnSpotMark({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="onspot-mark"
    >
      <defs>
        <linearGradient id="onspot-mark-grad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f06543" />
        </linearGradient>
      </defs>
      <path
        d="M32 6C19.85 6 10 15.85 10 28c0 14.84 17.8 29.68 20.32 31.7a2.8 2.8 0 0 0 3.36 0C36.2 57.68 54 42.84 54 28 54 15.85 44.15 6 32 6Z"
        fill="url(#onspot-mark-grad)"
        stroke="#ffffff"
        strokeWidth="3"
      />
      <circle cx="32" cy="27.5" r="8.5" fill="#18181b" />
      <circle cx="32" cy="27.5" r="3.6" fill="#ffffff" />
    </svg>
  );
}

export default function OnSpotLogo({ compact = false }) {
  return (
    <div className={`onspot-logo ${compact ? "onspot-logo--compact" : ""}`}>
      <OnSpotMark size={compact ? 24 : 28} />
      <span className="onspot-logo__name">OnSpot</span>
    </div>
  );
}
