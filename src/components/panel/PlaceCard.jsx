import { formatDistance } from "../../utils/distance";
import { getGoogleMapsSearchUrl } from "../../utils/maps";

export default function PlaceCard({ outlet, index, isActive, onFocus }) {
  return (
    <article className={`place-card ${isActive ? "place-card--active" : ""}`}>
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

      <div className="place-card__meta">
        <span>{outlet.bestItem}</span>
        <span>{outlet.priceRange}</span>
        <span>{formatDistance(outlet.distanceKm)}</span>
      </div>

      <div className="tag-row">
        {outlet.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="place-card__actions">
        <button type="button" className="primary-button" onClick={() => onFocus(outlet)}>
          View on map
        </button>
        <a href={getGoogleMapsSearchUrl(outlet.lat, outlet.lng)} target="_blank" rel="noreferrer">
          Open route
        </a>
      </div>
    </article>
  );
}
