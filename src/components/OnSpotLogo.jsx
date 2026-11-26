export function OnSpotMark({ size = 38 }) {
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
          <stop offset="0%" stopColor="#f06543" />
          <stop offset="100%" stopColor="#f38c52" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#1b1f28" />
      <rect x="3" y="3" width="58" height="58" rx="15" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <path
        d="M32 12C22.61 12 15 19.61 15 29c0 11.42 13.71 22.84 15.65 24.4a2.15 2.15 0 0 0 2.7 0C35.29 51.84 49 40.42 49 29c0-9.39-7.61-17-17-17Z"
        fill="url(#onspot-mark-grad)"
      />
      <circle cx="32" cy="28.5" r="7.5" fill="#1b1f28" />
      <circle cx="32" cy="28.5" r="3.2" fill="#ffffff" />
    </svg>
  );
}

export default function OnSpotLogo({ compact = false }) {
  return (
    <div className={`onspot-logo ${compact ? "onspot-logo--compact" : ""}`}>
      <OnSpotMark size={compact ? 30 : 40} />
      <div className="onspot-logo__text">
        <span className="onspot-logo__name">
          On<span className="onspot-logo__accent">Spot</span>
        </span>
        {!compact && <span className="onspot-logo__tag">Hidden Bites · India</span>}
      </div>
    </div>
  );
}
