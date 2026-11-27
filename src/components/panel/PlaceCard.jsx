import { formatDistance } from "../../utils/distance";
import { getGoogleMapsDirectionsUrl } from "../../utils/maps";

export default function PlaceCard({ outlet, index, isActive, onFocus }) {
  return (
    <article
      className={`place-card ${isActive ? "place-card--active" : ""}`}
      style={{ "--card-index": index }}
    >
      <div className="place-card__top">
        <span className="place-rank">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <p className="place-card__eyebrow">
            {outlet.neighborhood} · {outlet.category}
          </p>
          <h3>{outlet.name}</h3>
        </div>
      </div>

      <p className="place-card__story">{outlet.whyUnderrated}</p>

      <div className="place-card__insights">
        <p>
          <span className="place-card__label">Best order</span>
          <strong>{outlet.bestItem}</strong>
        </p>
        <p>
          <span className="place-card__label">Known for</span>
          <strong>{outlet.knownFor}</strong>
        </p>
      </div>

      <div className="place-card__meta">
        <span>{outlet.priceRange}</span>
        <span>{outlet.vibe}</span>
        <span>{formatDistance(outlet.distanceKm, outlet.distanceReferenceLabel)}</span>
      </div>

      <div className="tag-row">
        {outlet.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="place-card__trust">
        <span>Curated by {outlet.curatedBy}</span>
        <span>Verified {outlet.lastVerified}</span>
      </div>

      <div className="place-card__actions">
        <button
          type="button"
          className="primary-button"
          aria-pressed={isActive}
          onClick={() => onFocus(outlet)}
        >
          View on map
        </button>
        <a
          href={getGoogleMapsDirectionsUrl(outlet.lat, outlet.lng)}
          target="_blank"
          rel="noreferrer"
        >
          Open route
        </a>
      </div>
    </article>
  );
}
