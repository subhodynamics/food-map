import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export default function LaunchSplash({ onComplete }) {
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion() ? "done" : "playing"
  );

  useEffect(() => {
    if (phase === "done") {
      onComplete?.();
      return undefined;
    }

    if (phase === "playing") {
      const exitTimer = window.setTimeout(() => {
        setPhase("exiting");
      }, 2000);
      return () => window.clearTimeout(exitTimer);
    }

    onComplete?.();
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, 950);

    return () => window.clearTimeout(doneTimer);
  }, [phase, onComplete]);

  if (phase === "done") {
    return null;
  }

  const isExiting = phase === "exiting";

  return (
    <div
      className={`opener-stage ${isExiting ? "opener-stage--exiting" : ""}`}
      onClick={() => setPhase("exiting")}
      aria-hidden="true"
    >
      <div className="opener-backdrop" />

      <div className="opener-clouds">
        <svg
          className="opener-cloud opener-cloud--left-back"
          viewBox="0 0 600 420"
          preserveAspectRatio="none"
        >
          <path
            d="M-40 420 L-40 60 C40 40, 140 55, 200 110 C255 65, 355 75, 405 140 C475 145, 535 205, 515 275 C565 305, 575 375, 530 420 Z"
            fill="#f7f5ef"
          />
        </svg>

        <svg
          className="opener-cloud opener-cloud--right-back"
          viewBox="0 0 600 420"
          preserveAspectRatio="none"
        >
          <path
            d="M640 420 L640 45 C540 30, 445 60, 390 120 C320 75, 220 95, 175 165 C105 170, 55 235, 80 305 C35 335, 45 385, 95 420 Z"
            fill="#f7f5ef"
          />
        </svg>

        <svg
          className="opener-cloud opener-cloud--left-front"
          viewBox="0 0 540 360"
          preserveAspectRatio="none"
        >
          <path
            d="M-30 360 L-30 95 C45 75, 130 95, 180 145 C235 110, 315 125, 355 180 C425 185, 470 245, 445 305 C470 330, 460 350, 435 360 Z"
            fill="#ffffff"
          />
        </svg>

        <svg
          className="opener-cloud opener-cloud--right-front"
          viewBox="0 0 540 360"
          preserveAspectRatio="none"
        >
          <path
            d="M570 360 L570 85 C495 70, 405 95, 355 150 C295 115, 215 135, 175 190 C110 195, 65 255, 95 315 C70 338, 82 352, 110 360 Z"
            fill="#ffffff"
          />
        </svg>

        <div className="opener-cloud-mist opener-cloud-mist--top" />
        <div className="opener-cloud-mist opener-cloud-mist--bottom" />
      </div>

      <div className="opener-food-layer">
        {/* 1. Steaming Ramen / Noodle Bowl */}
        <div className="opener-food-slot opener-food-slot--noodles">
          <svg className="opener-food-svg opener-food-svg--slow" viewBox="0 0 96 96" width="84" height="84" fill="none">
            <defs>
              <linearGradient id="noodle-bowl" x1="16" y1="46" x2="80" y2="82" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e85d3a" />
                <stop offset="100%" stopColor="#b8371c" />
              </linearGradient>
              <linearGradient id="noodle-broth" x1="20" y1="38" x2="76" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <ellipse cx="48" cy="46" rx="31" ry="10" fill="#7c2d12" />
            <ellipse cx="48" cy="46" rx="28" ry="8" fill="url(#noodle-broth)" />
            {/* Noodles */}
            <path d="M26 46c4-8 10-8 14 0s10 8 14 0 10-8 14 0" stroke="#fef08a" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M29 43c4-6 9-6 13 0s9 6 13 0 9-6 12 0" stroke="#fde047" strokeWidth="3.2" strokeLinecap="round" />
            {/* Soft-boiled egg */}
            <ellipse cx="61" cy="42" rx="7" ry="4.5" fill="#fffbeb" />
            <ellipse cx="61" cy="42" rx="3.4" ry="2.2" fill="#f59e0b" />
            {/* Scallions */}
            <circle cx="38" cy="41" r="2.2" fill="#22c55e" />
            <circle cx="44" cy="39" r="1.9" fill="#16a34a" />
            {/* Chopsticks */}
            <path d="M36 41L66 15" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M43 43L73 20" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
            {/* Bowl */}
            <path d="M17 46a31 31 0 0 0 62 0H17Z" fill="url(#noodle-bowl)" />
            <path d="M24 54c5 1 11 1.5 18 1.5" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="37" y="75" width="22" height="5" rx="2.5" fill="#9a3412" />
            {/* Steam */}
            <path className="food-steam" d="M32 30c-2-4 2-7 0-11M46 28c-2-4 2-7 0-11" stroke="#a1a1aa" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* 2. Hot Coffee Cup */}
        <div className="opener-food-slot opener-food-slot--coffee">
          <svg className="opener-food-svg opener-food-svg--med" viewBox="0 0 96 96" width="74" height="74" fill="none">
            <ellipse cx="46" cy="74" rx="28" ry="6" fill="#e4e4e7" />
            <ellipse cx="46" cy="72" rx="24" ry="4.5" fill="#ffffff" />
            <path d="M24 38h40v21c0 9.4-8.95 16-20 16s-20-6.6-20-16V38Z" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
            <path d="M64 43h5a6.5 6.5 0 0 1 0 13h-5" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M64 43h5a6.5 6.5 0 0 1 0 13h-5" stroke="#d4d4d8" strokeWidth="1.4" strokeLinecap="round" />
            <ellipse cx="44" cy="38" rx="20" ry="6.5" fill="#f4f4f5" />
            <ellipse cx="44" cy="38" rx="16.5" ry="4.8" fill="#6f3e1d" />
            <path d="M39 38c3-2 7-2 10 0" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
            <path className="food-steam" d="M38 26c-2-3.5 2-6.5 0-10M49 25c-2-3.5 2-6.5 0-10" stroke="#a1a1aa" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* 3. Golden Croissant */}
        <div className="opener-food-slot opener-food-slot--croissant">
          <svg className="opener-food-svg opener-food-svg--fast" viewBox="0 0 96 96" width="76" height="76" fill="none">
            <defs>
              <linearGradient id="croissant-gold" x1="16" y1="28" x2="78" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            <path
              d="M16 58c0-15 14-27 32-27s32 12 32 27c0 6-4.5 10-10.5 10-4.5 0-8-2.5-21.5-2.5S31 68 26.5 68C20.5 68 16 64 16 58Z"
              fill="url(#croissant-gold)"
            />
            <path d="M35 33c-3 10-4 20-3 32M61 33c3 10 4 20 3 32M48 31v34" stroke="#92400e" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M39 39c4-2 12-2 17 0" stroke="#fef3c7" strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>

        {/* 4. Pizza Slice */}
        <div className="opener-food-slot opener-food-slot--pizza">
          <svg className="opener-food-svg opener-food-svg--slow" viewBox="0 0 96 96" width="74" height="74" fill="none">
            <path d="M48 16L76 68c-16 8-40 8-56 0L48 16Z" fill="#fde047" />
            <path d="M20 68c16 8 40 8 56 0l-3.5-6.5c-14 6.5-35 6.5-49 0L20 68Z" fill="#d97706" />
            <path d="M48 22L70 63c-13 5.5-31 5.5-44 0L48 22Z" fill="#facc15" />
            <circle cx="48" cy="40" r="5" fill="#dc2626" />
            <circle cx="39" cy="54" r="4.5" fill="#dc2626" />
            <circle cx="57" cy="55" r="4.5" fill="#dc2626" />
            <ellipse cx="48" cy="51" rx="3.2" ry="1.8" transform="rotate(-25 48 51)" fill="#16a34a" />
          </svg>
        </div>

        {/* 5. Steamed Momo / Dumpling */}
        <div className="opener-food-slot opener-food-slot--momo">
          <svg className="opener-food-svg opener-food-svg--med" viewBox="0 0 96 96" width="72" height="72" fill="none">
            <ellipse cx="48" cy="69" rx="28" ry="6" fill="#e5e7eb" />
            <path d="M22 57c0-15 11-29 26-29s26 14 26 29c0 8-6 12-26 12S22 65 22 57Z" fill="#fffbeb" stroke="#e7e5e4" strokeWidth="1.5" />
            <path d="M36 31c4 5 8 7 12 7s8-2 12-7" stroke="#d6d3d1" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M41 29l7 8 7-8M48 28v10" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="27" r="2.5" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      <div className="opener-center">
        <div className="opener-pin-drop">
          <svg
            viewBox="0 0 64 64"
            width="48"
            height="48"
            fill="none"
            className="opener-pin-icon"
          >
            <path
              d="M32 6C19.85 6 10 15.85 10 28c0 14.84 17.8 29.68 20.32 31.7a2.8 2.8 0 0 0 3.36 0C36.2 57.68 54 42.84 54 28 54 15.85 44.15 6 32 6Z"
              fill="#f06543"
            />
            <circle cx="32" cy="27.5" r="8" fill="#faf8f4" />
            <circle cx="32" cy="27.5" r="3.4" fill="#18181b" />
          </svg>
          <span className="opener-pin-shadow" />
        </div>

        <div className="opener-title-mask">
          <span className="opener-title">
            On<span className="opener-title__accent">Spot</span>
          </span>
        </div>

        <div className="opener-tagline-mask">
          <p className="opener-tagline">Discover the spots locals quietly love.</p>
        </div>
      </div>
    </div>
  );
}
