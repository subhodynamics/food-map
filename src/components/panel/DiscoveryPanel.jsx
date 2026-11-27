import { GEOLOCATION_STATUS } from "../../constants/explorer";
import OnSpotLogo, { OnSpotMark } from "../OnSpotLogo";
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
  isLoadingCity,
  dataError,
  sheetState,
  onChangeSheetState,
  onOpenAddSpot,
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

  const sheetSummary = activeLabel
    ? `${activeLabel} · ${visibleOutlets.length} ${visibleOutlets.length === 1 ? "spot" : "spots"}`
    : `${cityCatalog.length} cities · ${totalOutlets} hidden bites`;

  function cycleSheetState() {
    if (sheetState === "collapsed") {
      onChangeSheetState("half");
    } else if (sheetState === "half") {
      onChangeSheetState("expanded");
    } else {
      onChangeSheetState("collapsed");
    }
  }

  return (
    <aside className={`discovery-panel discovery-panel--${sheetState}`}>
      <div className="sheet-controls">
        <button
          type="button"
          className="sheet-handle-btn"
          onClick={cycleSheetState}
          aria-label="Toggle discovery sheet size"
        >
          <span className="sheet-handle" />
        </button>
        <div className="sheet-summary-row">
          <button
            type="button"
            className="sheet-summary-title"
            onClick={cycleSheetState}
          >
            <OnSpotMark size={28} />
            <span className="sheet-summary-copy">
              <span className="sheet-summary-eyebrow">OnSpot · India</span>
              <strong>{sheetSummary}</strong>
            </span>
          </button>
          <div className="sheet-summary-actions">
            <button
              type="button"
              className="sheet-toggle-btn"
              onClick={onOpenAddSpot}
              aria-label="Add a spot"
            >
              + Spot
            </button>
            {sheetState !== "collapsed" && (
              <button
                type="button"
                className="sheet-toggle-btn"
                onClick={() => onChangeSheetState("collapsed")}
              >
                Map
              </button>
            )}
            <button
              type="button"
              className="sheet-toggle-btn sheet-toggle-btn--accent"
              onClick={() =>
                onChangeSheetState(sheetState === "expanded" ? "half" : "expanded")
              }
            >
              {sheetState === "expanded" ? "Split" : "List"}
            </button>
          </div>
        </div>
      </div>

      <div className="panel-hero">
        <div className="panel-brand-row">
          <OnSpotLogo />
          <button type="button" className="add-spot-btn" onClick={onOpenAddSpot}>
            + Add a Spot
          </button>
        </div>
        <h1>Discover the spots locals quietly love.</h1>
        <p className="panel-copy">
          Search a city, then explore the low-key cafes, bakeries, and comfort-food
          spots curated there.
        </p>
        {dataError && <p className="panel-warning">{dataError}</p>}
      </div>

      <div className="panel-status">
        <span className="status-pill">
          <strong>{cityCatalog.length}</strong> curated cities
        </span>
        <span className="status-pill">
          {activeLabel ? `Exploring: ${activeLabel}` : `${totalOutlets} curated spots`}
        </span>
        <span className="status-pill">{locationLabel}</span>
      </div>

      <div className="panel-subsection">
        <div className="panel-subsection__head">
          <p className="section-label">Cities ({cityCatalog.length})</p>
          {(isCitySelected || hasSearchWithoutData) && (
            <button type="button" className="subtle-button subtle-button--compact" onClick={onReset}>
              Reset to India
            </button>
          )}
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

          {isLoadingCity ? (
            <div className="loading-state">
              <p className="section-label">Loading spots</p>
              <p className="section-meta">Fetching curated recommendations for {activeCityData.name}...</p>
            </div>
          ) : visibleOutlets.length ? (
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
              description="The map found the city, but there are no approved spots here yet. Know a local favourite? Add it to OnSpot!"
            />
          )}
        </>
      ) : hasSearchWithoutData ? (
        <EmptyState
          eyebrow="No city data yet"
          title={`No curated spots in ${searchedArea.city} yet.`}
          description="The map found the city, but there are no approved spots here yet. Click '+ Add a Spot' above to suggest a local favourite!"
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
