import { useState } from "react";

import AddSpotModal from "./components/AddSpotModal";
import DiscoveryPanel from "./components/panel/DiscoveryPanel";
import MapSearch from "./components/MapSearch";
import FoodMap from "./components/map/FoodMap";
import {
  CATEGORY_ALL_LABEL,
  DEFAULT_VIEWPORT
} from "./constants/explorer";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useExplorerData } from "./hooks/useExplorerData";
import { useOutlets } from "./hooks/useOutlets";
import "./styles/map.css";
import { normalizeCityName } from "./utils/city";

export default function App() {
  const { user, locationState } = useCurrentLocation();
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [activeCity, setActiveCity] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL_LABEL);
  const [activeTag, setActiveTag] = useState(null);
  const [searchedArea, setSearchedArea] = useState(null);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [sheetState, setSheetState] = useState("half");
  const [isAddSpotOpen, setIsAddSpotOpen] = useState(false);

  const {
    cityCatalog,
    totalOutlets,
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

  const activeOutlet =
    visibleOutlets.find(outlet => outlet.id === activeOutletId) ||
    cityOutlets.find(outlet => outlet.id === activeOutletId) ||
    null;

  const quickFilters = [];
  const quickFilterCounts = {};

  for (const outlet of cityOutlets) {
    for (const tag of outlet.tags) {
      quickFilterCounts[tag] = (quickFilterCounts[tag] || 0) + 1;
    }
  }

  Object.entries(quickFilterCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .forEach(([tag]) => {
      quickFilters.push(tag);
    });

  const filteredOutlets = activeTag
    ? visibleOutlets.filter(outlet => outlet.tags.includes(activeTag))
    : visibleOutlets;

  const featuredOutlet = filteredOutlets[0] || null;

  function focusOutlet(outlet) {
    setActiveOutletId(outlet.id);
    setViewport({
      center: [outlet.lat, outlet.lng],
      zoom: 15
    });
    setSheetState("collapsed");
  }

  function handleAreaSearch(area) {
    const normalizedCity = normalizeCityName(area.city);

    setActiveCity(normalizedCity);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveTag(null);
    setActiveOutletId(null);
    setSearchedArea(area);
    setViewport({
      center: [area.lat, area.lng],
      zoom: 14
    });
    setSheetState("half");
  }

  function resetArea() {
    setActiveCity(null);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveTag(null);
    setActiveOutletId(null);
    setSearchedArea(null);
    setViewport(DEFAULT_VIEWPORT);
    setSheetState("half");
  }

  function exploreCity(city) {
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
    setViewport({
      center: city.center,
      zoom: 13
    });
    setSheetState("half");
  }

  return (
    <div className="app-shell">
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
        featuredOutlet={featuredOutlet}
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
          setActiveOutletId(null);
        }}
        onSelectTag={tag => {
          setActiveTag(currentTag => currentTag === tag ? null : tag);
          setActiveOutletId(null);
        }}
        onFocusOutlet={focusOutlet}
      />

      <section className="map-stage">
        <FoodMap
          viewport={viewport}
          user={user}
          outlets={filteredOutlets}
          activeOutletId={activeOutletId}
          onSelectOutlet={setActiveOutletId}
          onClearSelection={() => setActiveOutletId(null)}
        />
        <MapSearch
          cityOptions={cityCatalog}
          hasActiveArea={Boolean(activeCity || searchedArea)}
          onPlaceSelect={handleAreaSearch}
        />
      </section>
      <AddSpotModal
        isOpen={isAddSpotOpen}
        initialCity={activeCityData?.name || searchedArea?.city || "Bengaluru"}
        initialCenter={activeCityData?.center || (searchedArea ? [searchedArea.lat, searchedArea.lng] : null)}
        isLiveBackend={isLiveBackend}
        onClose={() => setIsAddSpotOpen(false)}
      />
    </div>
  );
}
