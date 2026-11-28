import { useState } from "react";

import { getCategoryIconSvg, getCategoryTheme } from "../../constants/categories";
import { formatDistance } from "../../utils/distance";
import { getGoogleMapsDirectionsUrl } from "../../utils/maps";

const PRICE_TIER_META = {
  "₹": { label: "Budget-friendly", percent: 34 },
  "₹₹": { label: "Moderate", percent: 67 },
  "₹₹₹": { label: "Treat spot", percent: 100 }
};

export default function SpotDetailCard({
  outlet,
  spotIndex,
  totalSpots,
  prevOutlet,
  nextOutlet,
  onSelectOutlet,
  onBackToList
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  const theme = getCategoryTheme(outlet.category);
  const priceMeta = PRICE_TIER_META[outlet.priceRange] || {
    label: outlet.priceRange || "Moderate",
    percent: 60
  };
  const distanceText = formatDistance(outlet.distanceKm, outlet.distanceReferenceLabel);

  const slides = [
    {
      eyebrow: `${outlet.neighborhood} · ${outlet.category}`,
      headline: outlet.name,
      subline: outlet.vibe
    },
    {
      eyebrow: "What to order",
      headline: outlet.bestItem,
      subline: outlet.knownFor
    },
    {
      eyebrow: "Local consensus",
      headline: `Curated by ${outlet.curatedBy}`,
      subline: `Verified ${outlet.lastVerified} · ${outlet.priceRange}`
    }
  ];

  const activeSlide = slides[slideIndex];

  function handlePrevSlide() {
    setSlideIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  }

  function handleNextSlide() {
    setSlideIndex(prev => (prev + 1) % slides.length);
  }

  return (
    <div className="spot-detail">
      <div
        className="spot-detail__hero"
        style={{ background: theme.heroGradient }}
      >
        <div className="spot-detail__hero-pattern" aria-hidden="true" />

        <div className="spot-detail__hero-top">
          <button
            type="button"
            className="hero-pill-btn"
            onClick={onBackToList}
            aria-label="Back to shortlist"
          >
            ← All spots
          </button>
          <button
            type="button"
            className="hero-close-btn"
            onClick={onBackToList}
            aria-label="Close spot details"
          >
            ×
          </button>
        </div>

        <div className="spot-detail__hero-center">
          <span
            className="spot-detail__hero-emblem"
            dangerouslySetInnerHTML={{
              __html: getCategoryIconSvg(outlet.category, 26)
            }}
          />
          <p className="spot-detail__hero-eyebrow">{activeSlide.eyebrow}</p>
          <p className="spot-detail__hero-headline">{activeSlide.headline}</p>
          <p className="spot-detail__hero-subline">{activeSlide.subline}</p>
        </div>

        <button
          type="button"
          className="hero-nav-btn hero-nav-btn--left"
          onClick={handlePrevSlide}
          aria-label="Previous highlight"
        >
          ‹
        </button>
        <button
          type="button"
          className="hero-nav-btn hero-nav-btn--right"
          onClick={handleNextSlide}
          aria-label="Next highlight"
        >
          ›
        </button>

        <div className="spot-detail__hero-bottom">
          <span className="rank-amber-pill">
            #{spotIndex + 1} of {totalSpots}
          </span>

          <div className="hero-dots" role="tablist" aria-label="Spot highlights">
            {slides.map((slide, idx) => (
              <button
                key={slide.eyebrow}
                type="button"
                role="tab"
                aria-selected={slideIndex === idx}
                aria-label={`Highlight ${idx + 1}`}
                className={`hero-dot ${slideIndex === idx ? "hero-dot--active" : ""}`}
                onClick={() => setSlideIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="spot-detail__body">
        <div className="spot-detail__badges">
          <span className="cream-pill">{outlet.city}</span>
          <span
            className="cream-pill"
            style={{ background: theme.badgeBg, color: theme.badgeText }}
          >
            {outlet.category}
          </span>
        </div>

        <h1 className="spot-detail__title">{outlet.name}</h1>
        <p className="spot-detail__subtitle">
          {outlet.neighborhood}
          {distanceText ? ` · ${distanceText}` : ""}
        </p>

        <p className="spot-detail__story">{outlet.whyUnderrated}</p>

        <div className="meter-block">
          <div className="meter-block__head">
            <span>Price tier</span>
            <strong>
              {outlet.priceRange} · {priceMeta.label}
            </strong>
          </div>
          <div className="meter-track" aria-hidden="true">
            <div
              className="meter-fill"
              style={{ width: `${priceMeta.percent}%` }}
            />
          </div>
        </div>

        <a
          className="spot-detail__external-link"
          href={getGoogleMapsDirectionsUrl(outlet.lat, outlet.lng)}
          target="_blank"
          rel="noreferrer"
        >
          Directions on Google Maps ↗
        </a>

        <dl className="spot-meta-table">
          <div className="spot-meta-row">
            <dt>Best order</dt>
            <dd>{outlet.bestItem}</dd>
          </div>
          <div className="spot-meta-row">
            <dt>Known for</dt>
            <dd>{outlet.knownFor}</dd>
          </div>
          <div className="spot-meta-row">
            <dt>Vibe</dt>
            <dd>{outlet.vibe}</dd>
          </div>
          <div className="spot-meta-row">
            <dt>Curated by</dt>
            <dd>{outlet.curatedBy}</dd>
          </div>
          <div className="spot-meta-row">
            <dt>Verified</dt>
            <dd>{outlet.lastVerified}</dd>
          </div>
        </dl>

        {outlet.tags.length > 0 && (
          <div className="spot-detail__tags">
            {outlet.tags.map(tag => (
              <span key={tag} className="soft-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {totalSpots > 1 && (
        <div className="spot-detail__footer">
          <button
            type="button"
            className="footer-nav-btn"
            onClick={() => prevOutlet && onSelectOutlet(prevOutlet)}
            disabled={!prevOutlet}
          >
            ← #{prevOutlet?.rank} {prevOutlet?.name}
          </button>
          <button
            type="button"
            className="footer-nav-btn footer-nav-btn--right"
            onClick={() => nextOutlet && onSelectOutlet(nextOutlet)}
            disabled={!nextOutlet}
          >
            #{nextOutlet?.rank} {nextOutlet?.name} →
          </button>
        </div>
      )}
    </div>
  );
}
