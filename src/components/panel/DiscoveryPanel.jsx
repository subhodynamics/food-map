import { GEOLOCATION_STATUS } from "../../constants/explorer";
import PlaceCard from "./PlaceCard";

function EmptyState({ eyebrow, title, description }) {
  return (
    <div className="empty-state">
      <p className="section-label">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function DiscoveryPanel({
  cityCatalog,
  activeCity,
  activeCityData,
  activeCategory,
  categories,
  activeTag,
  quickFilters,
  searchedArea,
  visibleOutlets,
  featuredOutlet,
  activeOutlet,
  referencePoint,
  locationState,
  totalOutlets,
  hasSearchWithoutData,
  onExploreCity,
  onReset,
  onSelectCategory,
  onSelectTag,
  onFocusOutlet
}) {
  const isCitySelected = Boolean(activeCityData);
  const activeLabel = activeCityData?.name || searchedArea?.city || null;
  const locationLabel =
    locationState === GEOLOCATION_STATUS.READY
      ? "Your location is visible on the map"
      : "Location optional";

  return (
    <aside className="discovery-panel">
      <div className="panel-hero">
        <p className="panel-kicker">Underrated restos and cafes</p>
        <h1>India hidden bites map</h1>
        <p className="panel-copy">
          Search a city, then explore the low-key cafes, bakeries, and comfort-food
          spots curated there.
        </p>
      </div>

      <div className="panel-status">
        <span className="status-pill">
          <strong>{cityCatalog.length}</strong> curated cities
        </span>
        <span className="status-pill">
          {activeLabel ? `Exploring: ${activeLabel}` : "Search a city to begin"}
        </span>
        <span className="status-pill">
          {isCitySelected || hasSearchWithoutData
            ? `${visibleOutlets.length} spots in view`
            : `${totalOutlets} places in the dataset`}
        </span>
        <span className="status-pill">{locationLabel}</span>
      </div>

      <div className="panel-subsection">
        <div className="panel-subsection__head">
          <p className="section-label">Cities</p>
          <p className="section-meta">{cityCatalog.length} available</p>
        </div>
        <div className="city-list">
          {cityCatalog.map(city => (
            <button
              key={city.id}
              type="button"
              className={`city-chip ${activeCity === city.id ? "city-chip--active" : ""}`}
              onClick={() => onExploreCity(city)}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-tools">
        <button type="button" className="subtle-button" onClick={onReset}>
          Reset to India
        </button>
      </div>

      {isCitySelected && (
        <div className="panel-actions">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={`chip ${activeCategory === category ? "chip--active" : ""}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {isCitySelected && quickFilters.length > 0 && (
        <div className="panel-subsection">
          <div className="panel-subsection__head">
            <p className="section-label">Quick filters</p>
            {activeTag && <p className="section-meta">Tag: {activeTag}</p>}
          </div>
          <div className="panel-actions">
            {quickFilters.map(tag => (
              <button
                key={tag}
                type="button"
                className={`chip ${activeTag === tag ? "chip--active" : ""}`}
                onClick={() => onSelectTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCitySelected ? (
        <>
          {featuredOutlet && (
            <div className="featured-place">
              <div className="featured-place__copy">
                <p className="section-label">Start here</p>
                <h2>{featuredOutlet.name}</h2>
                <p className="featured-place__story">{featuredOutlet.whyUnderrated}</p>
              </div>
              <div className="featured-place__meta">
                <span>{featuredOutlet.neighborhood}</span>
                <span>{featuredOutlet.bestItem}</span>
                <span>Verified {featuredOutlet.lastVerified}</span>
              </div>
              <div className="tag-row">
                {featuredOutlet.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="featured-place__footer">
                <span>Curated by {featuredOutlet.curatedBy}</span>
                <button type="button" className="primary-button" onClick={() => onFocusOutlet(featuredOutlet)}>
                  Open featured pick
                </button>
              </div>
            </div>
          )}

          <div className="panel-section-head">
            <div>
              <p className="section-label">Closest to {referencePoint.label}</p>
              <h2>{activeCityData.name} shortlist</h2>
            </div>
            {activeOutlet && <p className="section-meta">Picked: {activeOutlet.name}</p>}
          </div>

          {visibleOutlets.length ? (
            <div className="places-list">
              {visibleOutlets.map((outlet, index) => (
                <PlaceCard
                  key={outlet.id}
                  outlet={outlet}
                  index={index}
                  isActive={activeOutlet?.id === outlet.id}
                  onFocus={onFocusOutlet}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="No city data yet"
              title={`No curated spots in ${searchedArea?.city || activeCityData.name} yet.`}
              description="The map found the city, but your local dataset does not have recommendations there yet. Add places for this city in the outlets file to make it explorable."
            />
          )}
        </>
      ) : hasSearchWithoutData ? (
        <EmptyState
          eyebrow="No city data yet"
          title={`No curated spots in ${searchedArea.city} yet.`}
          description="The map found the city, but your local dataset does not have recommendations there yet. Add places for this city in the outlets file to make it explorable."
        />
      ) : (
        <EmptyState
          eyebrow="Start with a city"
          title="Pick a city and we will help you find the spots locals quietly love."
          description="Search for Bengaluru, Mumbai, Kolkata, or any Indian city to start exploring underrated cafes and restos."
        />
      )}
    </aside>
  );
}
