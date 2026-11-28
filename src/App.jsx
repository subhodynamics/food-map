import { useCallback, useMemo, useState } from "react";

import AddSpotModal from "./components/AddSpotModal";
import LaunchSplash from "./components/LaunchSplash";
import DiscoveryPanel from "./components/panel/DiscoveryPanel";
import MapSearch from "./components/MapSearch";
import OnSpotLogo from "./components/OnSpotLogo";
import FoodMap from "./components/map/FoodMap";
import {
  CATEGORY_ALL_LABEL,
  DEFAULT_VIEWPORT
} from "./constants/explorer";
import { outlets as localOutlets } from "./data/outlets";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useExplorerData } from "./hooks/useExplorerData";
import { useOutlets } from "./hooks/useOutlets";
import { fetchOutletsByCity } from "./services/outletsService";
import "./styles/map.css";
import { normalizeCityName } from "./utils/city";

export default function App() {
  const { user, locationState } = useCurrentLocation();
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [hasDismissedSpot, setHasDismissedSpot] = useState(true);
  const [activeCity, setActiveCity] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL_LABEL);
  const [activeTag, setActiveTag] = useState(null);
  const [searchedArea, setSearchedArea] = useState(null);
  const [customViewport, setCustomViewport] = useState(null);
  const [sheetState, setSheetState] = useState("half");
  const [isAddSpotOpen, setIsAddSpotOpen] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setHasLaunched(true);
  }, []);

  const {
    cityCatalog,
    totalOutlets,
    allSpots,
    cityOutlets,
    isLoadingCity,
    dataError,
    isLiveBackend
  } = useOutlets(activeCity);

  const {
    activeCityData,
    categories,
    visibleOutlets,
    referencePoint,
    hasSearchWithoutData
  } = useExplorerData({
    cityCatalog,
    cityOutlets,
    activeCity,
    activeCategory,
    searchedArea,
    user
  });

  const quickFilters = useMemo(() => {
    const counts = {};
    for (const outlet of cityOutlets) {
      for (const tag of outlet.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [cityOutlets]);

  const filteredOutlets = useMemo(
    () =>
      activeTag
        ? visibleOutlets.filter(outlet => outlet.tags.includes(activeTag))
        : visibleOutlets,
    [visibleOutlets, activeTag]
  );

  const resolvedOutletId = useMemo(() => {
    if (activeOutletId) {
      return activeOutletId;
    }
    if (!hasDismissedSpot && activeCity && filteredOutlets.length > 0) {
      return filteredOutlets[0].id;
    }
    return null;
  }, [activeOutletId, hasDismissedSpot, activeCity, filteredOutlets]);

  const activeOutlet =
    filteredOutlets.find(outlet => outlet.id === resolvedOutletId) ||
    cityOutlets.find(outlet => outlet.id === resolvedOutletId) ||
    null;

  const viewport = useMemo(() => {
    if (customViewport) {
      return customViewport;
    }
    if (activeOutlet) {
      return {
        center: [activeOutlet.lat, activeOutlet.lng],
        zoom: 13.4
      };
    }
    if (activeCityData) {
      return {
        center: activeCityData.center,
        zoom: 12.6
      };
    }
    return DEFAULT_VIEWPORT;
  }, [customViewport, activeOutlet, activeCityData]);

  const searchableOutlets = useMemo(() => {
    const byId = new Map();
    const baseSpots = allSpots.length ? allSpots : localOutlets;
    for (const item of baseSpots) {
      byId.set(item.id, item);
    }
    for (const item of cityOutlets) {
      byId.set(item.id, item);
    }
    return Array.from(byId.values());
  }, [allSpots, cityOutlets]);

  function focusOutlet(outlet) {
    const targetCityId = normalizeCityName(outlet.city);
    setHasDismissedSpot(false);
    if (targetCityId && targetCityId !== activeCity) {
      setActiveCity(targetCityId);
      setActiveCategory(CATEGORY_ALL_LABEL);
      setActiveTag(null);
    }
    setActiveOutletId(outlet.id);
    setCustomViewport({
      center: [outlet.lat, outlet.lng],
      zoom: 14.6
    });
    setSheetState("half");
  }

  function handleAreaSearch(area) {
    const normalizedCity = normalizeCityName(area.city);
    setHasDismissedSpot(true);
    setActiveCity(normalizedCity);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveTag(null);
    setActiveOutletId(null);
    setSearchedArea(area);
    setCustomViewport({
      center: [area.lat, area.lng],
      zoom: 13
    });
    setSheetState("half");
  }

  function resetArea() {
    setHasDismissedSpot(true);
    setActiveCity(null);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveTag(null);
    setActiveOutletId(null);
    setSearchedArea(null);
    setCustomViewport(DEFAULT_VIEWPORT);
    setSheetState("half");
  }

  function exploreCity(city) {
    setHasDismissedSpot(true);
    setActiveCity(city.id);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveTag(null);
    setActiveOutletId(null);
    setSearchedArea({
      lat: city.center[0],
      lng: city.center[1],
      city: city.name,
      label: city.name
    });
    setCustomViewport({
      center: city.center,
      zoom: 12.6
    });
    setSheetState("half");
  }

  function dismissActiveOutlet() {
    setHasDismissedSpot(true);
    setActiveOutletId(null);
  }

  async function handleSurpriseMe() {
    const pool = filteredOutlets.length ? filteredOutlets : cityOutlets;

    if (pool.length > 0) {
      const candidates =
        pool.length > 1
          ? pool.filter(item => item.id !== resolvedOutletId)
          : pool;
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      if (picked) {
        if (activeTag && !picked.tags.includes(activeTag)) {
          setActiveTag(null);
        }
        focusOutlet(picked);
        return;
      }
    }

    if (cityCatalog.length > 0) {
      const randomCity =
        cityCatalog[Math.floor(Math.random() * cityCatalog.length)];
      setActiveCity(randomCity.id);
      setActiveCategory(CATEGORY_ALL_LABEL);
      setActiveTag(null);
      setSearchedArea({
        lat: randomCity.center[0],
        lng: randomCity.center[1],
        city: randomCity.name,
        label: randomCity.name
      });

      try {
        const spots = await fetchOutletsByCity(randomCity.id);
        if (spots.length > 0) {
          const picked = spots[Math.floor(Math.random() * spots.length)];
          focusOutlet(picked);
          return;
        }
      } catch {
        // Fallback to flying to the city center if fetching fails.
      }

      setCustomViewport({
        center: randomCity.center,
        zoom: 12.6
      });
    }
  }

  return (
    <div className={`app-shell ${hasLaunched ? "app-shell--ready" : ""}`}>
      <LaunchSplash onComplete={handleSplashComplete} />
      <main className="map-stage">
        <FoodMap
          viewport={viewport}
          user={user}
          outlets={filteredOutlets}
          cityCatalog={cityCatalog}
          activeCity={activeCity}
          activeOutletId={resolvedOutletId}
          onSelectOutlet={focusOutlet}
          onSelectCity={exploreCity}
          onClearSelection={dismissActiveOutlet}
        />

        <header className="top-overlay">
          <div className="top-overlay__left">
            <button
              type="button"
              className="brand-pill-btn"
              onClick={() => {
                if (resolvedOutletId) {
                  dismissActiveOutlet();
                } else {
                  resetArea();
                }
              }}
              aria-label="OnSpot home"
            >
              <OnSpotLogo />
            </button>
          </div>

          <div className="top-overlay__center">
            <MapSearch
              cityOptions={cityCatalog}
              searchableOutlets={searchableOutlets}
              onPlaceSelect={handleAreaSearch}
              onSelectSpot={focusOutlet}
            />
            {cityCatalog.length > 0 && (
              <nav className="city-bar" aria-label="Cities">
                <button
                  type="button"
                  className={`city-bar__pill ${!activeCity ? "city-bar__pill--active" : ""}`}
                  onClick={resetArea}
                >
                  All India
                </button>
                {cityCatalog.map(city => (
                  <button
                    key={city.id}
                    type="button"
                    className={`city-bar__pill ${activeCity === city.id ? "city-bar__pill--active" : ""}`}
                    onClick={() => exploreCity(city)}
                  >
                    <span>{city.name}</span>
                    <span className="city-bar__count">{city.count}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="top-overlay__right">
            <button
              type="button"
              className="top-add-btn"
              onClick={() => setIsAddSpotOpen(true)}
            >
              + Add spot
            </button>
            <button
              type="button"
              className="surprise-btn"
              onClick={handleSurpriseMe}
            >
              Surprise me
            </button>
          </div>
        </header>

        <DiscoveryPanel
          cityCatalog={cityCatalog}
          activeCity={activeCity}
          activeCityData={activeCityData}
          activeCategory={activeCategory}
          categories={categories}
          activeTag={activeTag}
          quickFilters={quickFilters}
          searchedArea={searchedArea}
          visibleOutlets={filteredOutlets}
          activeOutlet={activeOutlet}
          referencePoint={referencePoint}
          locationState={locationState}
          totalOutlets={totalOutlets}
          hasSearchWithoutData={hasSearchWithoutData}
          isLoadingCity={isLoadingCity}
          dataError={dataError}
          sheetState={sheetState}
          onChangeSheetState={setSheetState}
          onOpenAddSpot={() => setIsAddSpotOpen(true)}
          onExploreCity={exploreCity}
          onReset={resetArea}
          onSelectCategory={category => {
            setActiveCategory(category);
            setActiveTag(null);
            dismissActiveOutlet();
          }}
          onSelectTag={tag => {
            setActiveTag(currentTag => (currentTag === tag ? null : tag));
            dismissActiveOutlet();
          }}
          onFocusOutlet={focusOutlet}
          onClearActiveOutlet={dismissActiveOutlet}
        />
      </main>

      <AddSpotModal
        isOpen={isAddSpotOpen}
        initialCity={activeCityData?.name || searchedArea?.city || "Bengaluru"}
        initialCenter={
          activeCityData?.center ||
          (searchedArea ? [searchedArea.lat, searchedArea.lng] : null)
        }
        isLiveBackend={isLiveBackend}
        onClose={() => setIsAddSpotOpen(false)}
      />
    </div>
  );
}
