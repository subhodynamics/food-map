const CATEGORY_THEMES = {
  Coffee: {
    accent: "#9a4d22",
    badgeBg: "#f4e6d8",
    badgeText: "#7c3b16",
    heroGradient: "linear-gradient(145deg, #2d1b12 0%, #633820 52%, #a66038 100%)",
    markerBg: "#5c331c",
    iconPath:
      '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>'
  },
  Bakery: {
    accent: "#b45309",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    heroGradient: "linear-gradient(145deg, #3b2313 0%, #8a4b1f 55%, #d1863c 100%)",
    markerBg: "#8a4b1f",
    iconPath:
      '<path d="M4.6 13.11 5.79 9.5a2 2 0 0 1 1.9-1.37h8.62a2 2 0 0 1 1.9 1.37l1.19 3.61a2 2 0 0 1-.49 2.04l-1.56 1.56a2 2 0 0 1-1.41.59H8.06a2 2 0 0 1-1.41-.59l-1.56-1.56a2 2 0 0 1-.49-2.04Z"/><path d="M9 8v4"/><path d="M15 8v4"/><path d="M12 7v5"/>'
  },
  Breakfast: {
    accent: "#c26d18",
    badgeBg: "#ffedd5",
    badgeText: "#9a3412",
    heroGradient: "linear-gradient(145deg, #342514 0%, #8c5a1b 52%, #d99b38 100%)",
    markerBg: "#9a5b13",
    iconPath:
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v1.5"/><path d="M12 19.5V21"/>'
  },
  "Street Food": {
    accent: "#c2410c",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    heroGradient: "linear-gradient(145deg, #3a1412 0%, #992c1e 55%, #dc6035 100%)",
    markerBg: "#b93822",
    iconPath:
      '<path d="M3 11h18"/><path d="M5 11a7 7 0 0 1 14 0"/><path d="M5 15h14"/><path d="M6 15v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2"/>'
  },
  "South Indian": {
    accent: "#15803d",
    badgeBg: "#dcfce7",
    badgeText: "#166534",
    heroGradient: "linear-gradient(145deg, #102a1d 0%, #1d5c3b 55%, #379260 100%)",
    markerBg: "#1e6b43",
    iconPath:
      '<path d="M4 12a8 8 0 0 0 16 0Z"/><path d="M6 12c1.5-3 4.5-5 6-5s4.5 2 6 5"/><path d="M12 7V4"/>'
  },
  Asian: {
    accent: "#be123c",
    badgeBg: "#ffe4e6",
    badgeText: "#9f1239",
    heroGradient: "linear-gradient(145deg, #2d1221 0%, #7d2041 54%, #c44569 100%)",
    markerBg: "#8f2247",
    iconPath:
      '<path d="M12 21a8 8 0 0 0 8-8H4a8 8 0 0 0 8 8Z"/><path d="M7 13V5"/><path d="M11 13V4"/><path d="m15 13 4-9"/>'
  },
  Tibetan: {
    accent: "#0f766e",
    badgeBg: "#ccfbf1",
    badgeText: "#115e59",
    heroGradient: "linear-gradient(145deg, #11292e 0%, #1b5c61 54%, #319496 100%)",
    markerBg: "#165e63",
    iconPath:
      '<path d="M4 13a8 8 0 0 0 16 0Z"/><path d="M6 13c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M9 5c0-1 1-1.5 1-2.5"/><path d="M15 5c0-1 1-1.5 1-2.5"/>'
  },
  Italian: {
    accent: "#4d7c0f",
    badgeBg: "#ecfccb",
    badgeText: "#3f6212",
    heroGradient: "linear-gradient(145deg, #1f2b12 0%, #445f20 55%, #77983a 100%)",
    markerBg: "#4b6921",
    iconPath:
      '<path d="M12 2 4.5 19.5a1 1 0 0 0 1.2 1.35L12 18.5l6.3 2.35a1 1 0 0 0 1.2-1.35Z"/><circle cx="12" cy="11" r="1.4"/><circle cx="9.8" cy="15" r="1.2"/><circle cx="14.2" cy="14.5" r="1.2"/>'
  },
  Desserts: {
    accent: "#9333ea",
    badgeBg: "#f3e8ff",
    badgeText: "#6b21a8",
    heroGradient: "linear-gradient(145deg, #28163a 0%, #5c2a80 54%, #954ec0 100%)",
    markerBg: "#6a2e94",
    iconPath:
      '<path d="M7 10a5 5 0 0 1 10 0"/><path d="M5 10h14l-1.5 9a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7Z"/><circle cx="12" cy="4" r="1.5"/>'
  }
};

const DEFAULT_THEME = {
  accent: "#c2591a",
  badgeBg: "#fef3c7",
  badgeText: "#854d0e",
  heroGradient: "linear-gradient(145deg, #1e293b 0%, #334155 55%, #475569 100%)",
  markerBg: "#334155",
  iconPath:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'
};

export function getCategoryTheme(category) {
  return CATEGORY_THEMES[category] || DEFAULT_THEME;
}

export function getCategoryIconSvg(category, size = 18) {
  const theme = getCategoryTheme(category);
  return `
    <svg
      viewBox="0 0 24 24"
      width="${size}"
      height="${size}"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      ${theme.iconPath}
    </svg>
  `;
}
