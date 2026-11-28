import { useRef, useState } from "react";

import { getCategoryTheme } from "../../constants/categories";
import { GEOLOCATION_STATUS } from "../../constants/explorer";
import { formatDistance } from "../../utils/distance";
import SpotDetailCard from "./SpotDetailCard";

function EmptyState({ eyebrow, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-card-state">
      <p className="card-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="amber-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
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
  onFocusOutlet,
  onClearActiveOutlet
}) {
  const isCitySelected = Boolean(activeCityData);
  const activeLabel = activeCityData?.name || searchedArea?.city || null;
  const locationText =
    locationState === GEOLOCATION_STATUS.READY
      ? "Near you"
      : referencePoint.label;

  const activeIndex = activeOutlet
    ? visibleOutlets.findIndex(item => item.id === activeOutlet.id)
    : -1;

  const prevOutlet =
    visibleOutlets.length > 1 && activeIndex >= 0
      ? (() => {
          const prevIdx =
            activeIndex === 0 ? visibleOutlets.length - 1 : activeIndex - 1;
          return { ...visibleOutlets[prevIdx], rank: prevIdx + 1 };
        })()
      : null;

  const nextOutlet =
    visibleOutlets.length > 1 && activeIndex >= 0
      ? (() => {
          const nextIdx = (activeIndex + 1) % visibleOutlets.length;
          return { ...visibleOutlets[nextIdx], rank: nextIdx + 1 };
        })()
      : null;

  const sheetSummary = activeOutlet
    ? `${activeOutlet.name} · ${activeOutlet.neighborhood}`
    : activeLabel
      ? `${activeLabel} · ${visibleOutlets.length} ${visibleOutlets.length === 1 ? "spot" : "spots"}`
      : `${cityCatalog.length} cities · ${totalOutlets} hidden spots`;

  const sheetRef = useRef(null);
  const dragStartRef = useRef(null);
  const latestHeightRef = useRef(null);
  const didDragRef = useRef(false);
  const [dragHeightPx, setDragHeightPx] = useState(null);

  function cycleSheetState() {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (sheetState === "collapsed") {
      onChangeSheetState("half");
    } else if (sheetState === "half") {
      onChangeSheetState("expanded");
    } else {
      onChangeSheetState("collapsed");
    }
  }

  function handleTouchStart(event) {
    if (event.target.closest(".sheet-summary-actions")) {
      return;
    }
    const touch = event.touches?.[0];
    const sheetEl = sheetRef.current;
    if (!touch || !sheetEl) {
      return;
    }
    const currentHeight = sheetEl.getBoundingClientRect().height;
    didDragRef.current = false;
    latestHeightRef.current = currentHeight;
    dragStartRef.current = {
      startY: touch.clientY,
      startHeight: currentHeight
    };
  }

  function handleTouchMove(event) {
    if (!dragStartRef.current) {
      return;
    }
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }
    const deltaY = dragStartRef.current.startY - touch.clientY;
    if (Math.abs(deltaY) > 6) {
      didDragRef.current = true;
    }
    const viewportHeight = window.innerHeight || 800;
    const minHeight = 74;
    const maxHeight = Math.round(viewportHeight * 0.88);
    const nextHeight = Math.max(
      minHeight,
      Math.min(maxHeight, dragStartRef.current.startHeight + deltaY)
    );
    latestHeightRef.current = nextHeight;
    setDragHeightPx(nextHeight);
  }

  function handleTouchEnd() {
    if (!dragStartRef.current) {
      return;
    }
    const startHeight = dragStartRef.current.startHeight;
    const finalHeight = latestHeightRef.current ?? startHeight;
    const delta = finalHeight - startHeight;
    const viewportHeight = window.innerHeight || 800;
    const ratio = finalHeight / viewportHeight;

    dragStartRef.current = null;
    latestHeightRef.current = null;
    setDragHeightPx(null);

    if (!didDragRef.current) {
      return;
    }

    if (delta > 36) {
      onChangeSheetState(sheetState === "collapsed" && ratio < 0.72 ? "half" : "expanded");
    } else if (delta < -36) {
      onChangeSheetState(sheetState === "expanded" && ratio > 0.3 ? "half" : "collapsed");
    } else if (ratio < 0.24) {
      onChangeSheetState("collapsed");
    } else if (ratio > 0.7) {
      onChangeSheetState("expanded");
    } else {
      onChangeSheetState("half");
    }
  }

  const dragStyle = dragHeightPx
    ? {
        height: `${dragHeightPx}px`,
        maxHeight: `${dragHeightPx}px`,
        transition: "none"
      }
    : undefined;

  return (
    <aside
      ref={sheetRef}
      className={`floating-card floating-card--${sheetState}`}
      style={dragStyle}
    >
      <div
        className="sheet-controls"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <button
          type="button"
          className="sheet-handle-btn"
          onClick={cycleSheetState}
          aria-label="Toggle spot panel size"
        >
          <span className="sheet-handle" />
        </button>
        <div className="sheet-summary-row">
          <button
            type="button"
            className="sheet-summary-title"
            onClick={cycleSheetState}
          >
            <span className="sheet-summary-eyebrow">
              {activeOutlet ? `#${activeIndex + 1} of ${visibleOutlets.length}` : "OnSpot Explorer"}
            </span>
            <strong>{sheetSummary}</strong>
          </button>
          <div className="sheet-summary-actions">
            {activeOutlet && (
              <button
                type="button"
                className="sheet-toggle-btn"
                onClick={onClearActiveOutlet}
              >
                List
              </button>
            )}
            <button
              type="button"
              className="sheet-toggle-btn"
              onClick={() =>
                onChangeSheetState(sheetState === "collapsed" ? "half" : "collapsed")
              }
            >
              {sheetState === "collapsed" ? "Open" : "Map"}
            </button>
          </div>
        </div>
      </div>

      {activeOutlet && activeIndex >= 0 ? (
        <SpotDetailCard
          key={activeOutlet.id}
          outlet={activeOutlet}
          spotIndex={activeIndex}
          totalSpots={visibleOutlets.length}
          prevOutlet={prevOutlet}
          nextOutlet={nextOutlet}
          onSelectOutlet={onFocusOutlet}
          onBackToList={onClearActiveOutlet}
        />
      ) : (
        <div className="explorer-body">
          <div className="explorer-head">
            <div>
              <p className="card-kicker">
                {activeLabel ? `${activeLabel} · ${visibleOutlets.length} spots` : `${totalOutlets} curated spots`}
              </p>
              <h1 className="explorer-title">
                {activeLabel ? `Hidden bites in ${activeLabel}` : "Explore curated cities"}
              </h1>
            </div>
            {(isCitySelected || hasSearchWithoutData) && (
              <button type="button" className="text-reset-btn" onClick={onReset}>
                All India
              </button>
            )}
          </div>

          {dataError && <p className="card-warning">{dataError}</p>}

          <div className="filter-section">
            <p className="filter-section__label">Cities</p>
            <div className="pill-scroll-row">
              {cityCatalog.map(city => (
                <button
                  key={city.id}
                  type="button"
                  className={`filter-pill ${activeCity === city.id ? "filter-pill--amber" : ""}`}
                  onClick={() => onExploreCity(city)}
                >
                  {city.name}
                  <span className="filter-pill__count">{city.count}</span>
                </button>
              ))}
            </div>
          </div>

          {isCitySelected && (
            <div className="filter-section">
              <p className="filter-section__label">Categories</p>
              <div className="pill-scroll-row">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-pill ${activeCategory === category ? "filter-pill--dark" : ""}`}
                    onClick={() => onSelectCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCitySelected && quickFilters.length > 0 && (
            <div className="filter-section">
              <p className="filter-section__label">Vibe & tags</p>
              <div className="pill-scroll-row">
                {quickFilters.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-pill filter-pill--soft ${activeTag === tag ? "filter-pill--dark" : ""}`}
                    onClick={() => onSelectTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCitySelected ? (
            isLoadingCity ? (
              <div className="empty-card-state">
                <p className="card-kicker">Loading spots</p>
                <p>Fetching recommendations for {activeCityData.name}...</p>
              </div>
            ) : visibleOutlets.length ? (
              <div className="shortlist-block">
                <div className="shortlist-block__head">
                  <span>Shortlist</span>
                  <span>Sorted by {locationText}</span>
                </div>
                <div className="shortlist-rows">
                  {visibleOutlets.map((outlet, index) => {
                    const theme = getCategoryTheme(outlet.category);
                    return (
                      <button
                        key={outlet.id}
                        type="button"
                        className="shortlist-row"
                        onClick={() => onFocusOutlet(outlet)}
                      >
                        <span className="shortlist-row__rank">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="shortlist-row__main">
                          <span className="shortlist-row__title">{outlet.name}</span>
                          <span className="shortlist-row__sub">
                            {outlet.neighborhood} · {outlet.bestItem}
                          </span>
                        </span>
                        <span className="shortlist-row__right">
                          <span
                            className="shortlist-row__cat"
                            style={{ background: theme.badgeBg, color: theme.badgeText }}
                          >
                            {outlet.category}
                          </span>
                          <span className="shortlist-row__dist">
                            {formatDistance(outlet.distanceKm, outlet.distanceReferenceLabel)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                eyebrow="No spots match"
                title="No spots match this filter."
                description="Try clearing the category or tag filter, or add a hidden favourite."
                actionLabel="+ Add a Spot"
                onAction={onOpenAddSpot}
              />
            )
          ) : hasSearchWithoutData ? (
            <EmptyState
              eyebrow="No city data yet"
              title={`No curated spots in ${searchedArea.city} yet.`}
              description="The map found the city, but there are no approved spots here yet. Know a local favourite?"
              actionLabel="+ Add a Spot"
              onAction={onOpenAddSpot}
            />
          ) : (
            <EmptyState
              eyebrow="Select a city"
              title="Pick a city pill above or click a cluster on the map."
              description="Discover low-key cafes, bakeries, and comfort-food spots loved by locals."
            />
          )}
        </div>
      )}
    </aside>
  );
}
