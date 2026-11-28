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
      }, 1450);
      return () => window.clearTimeout(exitTimer);
    }

    onComplete?.();
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, 420);

    return () => window.clearTimeout(doneTimer);
  }, [phase, onComplete]);

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className={`opener-stage ${phase === "exiting" ? "opener-stage--exiting" : ""}`}
      onClick={() => setPhase("exiting")}
      aria-hidden="true"
    >
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
