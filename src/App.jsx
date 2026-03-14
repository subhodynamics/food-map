import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import DiscoveryPanel from "./components/panel/DiscoveryPanel";
import MapSearch from "./components/MapSearch";
import MapViewport from "./components/map/MapViewport";
import OutletMarkers from "./components/map/OutletMarkers";
import {
  CATEGORY_ALL_LABEL,
  DEFAULT_VIEWPORT
} from "./constants/explorer";
import { outlets } from "./data/outlets";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useExplorerData } from "./hooks/useExplorerData";
import "./styles/map.css";
import { normalizeCityName } from "./utils/city";

export default function App() {
  const { user, locationState } = useCurrentLocation();
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [activeCity, setActiveCity] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL_LABEL);
  const [searchedArea, setSearchedArea] = useState(null);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);

  const {
    cityCatalog,
    activeCityData,
    categories,
    visibleOutlets,
    referencePoint,
    hasSearchWithoutData
  } = useExplorerData({
    outlets,
    activeCity,
    activeCategory,
    searchedArea
  });

  const activeOutlet =
    visibleOutlets.find(outlet => outlet.id === activeOutletId) ||
    outlets.find(outlet => outlet.id === activeOutletId) ||
    null;

  function focusOutlet(outlet) {
    setActiveOutletId(outlet.id);
    setViewport({
      center: [outlet.lat, outlet.lng],
      zoom: 15
    });
  }

  function handleAreaSearch(area) {
    const normalizedCity = normalizeCityName(area.city);

    setActiveCity(normalizedCity);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveOutletId(null);
    setSearchedArea(area);
    setViewport({
      center: [area.lat, area.lng],
      zoom: 14
    });
  }

  function resetArea() {
    setActiveCity(null);
    setActiveCategory(CATEGORY_ALL_LABEL);
    setActiveOutletId(null);
    setSearchedArea(null);
    setViewport(DEFAULT_VIEWPORT);
  }

  function exploreCity(city) {
    setActiveCity(city.id);
    setActiveCategory(CATEGORY_ALL_LABEL);
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
  }

  return (
    <div className="app-shell">
      <DiscoveryPanel
        cityCatalog={cityCatalog}
        activeCity={activeCity}
        activeCityData={activeCityData}
        activeCategory={activeCategory}
        categories={categories}
        searchedArea={searchedArea}
        visibleOutlets={visibleOutlets}
        activeOutlet={activeOutlet}
        referencePoint={referencePoint}
        locationState={locationState}
        totalOutlets={outlets.length}
        hasSearchWithoutData={hasSearchWithoutData}
        onExploreCity={exploreCity}
        onReset={resetArea}
        onSelectCategory={category => {
          setActiveCategory(category);
          setActiveOutletId(null);
        }}
        onFocusOutlet={focusOutlet}
      />

      <section className="map-stage">
        <MapContainer center={DEFAULT_VIEWPORT.center} zoom={DEFAULT_VIEWPORT.zoom} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <MapViewport viewport={viewport} />
          <MapSearch cityOptions={cityCatalog} onPlaceSelect={handleAreaSearch} />
          <OutletMarkers
            user={user}
            outlets={visibleOutlets}
            activeOutletId={activeOutletId}
            onSelectOutlet={setActiveOutletId}
            onClearSelection={() => setActiveOutletId(null)}
          />
        </MapContainer>
      </section>
    </div>
  );
}
