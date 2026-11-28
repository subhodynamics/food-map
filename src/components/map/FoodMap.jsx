import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl
} from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(maplibreWorkerUrl);

import {
  createCityMarkerElement,
  createSpotMarkerElement,
  createUserLocationElement
} from "../../assets/icons";

const MAP_STYLES = [
  {
    id: "liberty",
    label: "Atlas",
    url: "https://tiles.openfreemap.org/styles/liberty"
  },
  {
    id: "voyager",
    label: "Crisp",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
  },
  {
    id: "positron",
    label: "Minimal",
    url: "https://tiles.openfreemap.org/styles/positron"
  },
  {
    id: "night",
    label: "Night",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  }
];

const OSM_FALLBACK_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm"
    }
  ]
};

function getDesktopMapPadding() {
  if (typeof window === "undefined") {
    return { top: 72, bottom: 32, left: 32, right: 32 };
  }
  if (window.innerWidth > 960) {
    return { top: 76, bottom: 36, left: 360, right: 48 };
  }
  return { top: 112, bottom: 220, left: 24, right: 24 };
}

export default function FoodMap({
  viewport,
  user,
  outlets,
  cityCatalog,
  activeCity,
  activeOutletId,
  onSelectOutlet,
  onSelectCity,
  onClearSelection
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const hasMountedViewportRef = useRef(false);
  const hasFallbackStyleRef = useRef(false);
  const userMarkerRef = useRef(null);
  const spotMarkersRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const onSelectOutletRef = useRef(onSelectOutlet);
  const onSelectCityRef = useRef(onSelectCity);
  const onClearSelectionRef = useRef(onClearSelection);
  const [activeStyleId, setActiveStyleId] = useState(MAP_STYLES[0].id);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  onSelectOutletRef.current = onSelectOutlet;
  onSelectCityRef.current = onSelectCity;
  onClearSelectionRef.current = onClearSelection;

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLES[0].url,
      center: [viewport.center[1], viewport.center[0]],
      zoom: viewport.zoom,
      attributionControl: false
    });

    map.setPadding(getDesktopMapPadding());

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("click", () => {
      setIsLayerMenuOpen(false);
    });

    map.on("error", event => {
      const status = event?.error?.status;
      if (!hasFallbackStyleRef.current && !map.isStyleLoaded() && status && status >= 400) {
        hasFallbackStyleRef.current = true;
        map.setStyle(OSM_FALLBACK_STYLE);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      hasMountedViewportRef.current = false;
    };
    // Initial center/zoom come from initial viewport; subsequent updates use flyTo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStyleChange(styleOption) {
    setActiveStyleId(styleOption.id);
    setIsLayerMenuOpen(false);
    if (mapRef.current) {
      hasFallbackStyleRef.current = false;
      mapRef.current.setStyle(styleOption.url);
    }
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!hasMountedViewportRef.current) {
      hasMountedViewportRef.current = true;
      return;
    }

    map.flyTo({
      center: [viewport.center[1], viewport.center[0]],
      zoom: viewport.zoom,
      padding: getDesktopMapPadding(),
      duration: 950,
      essential: true
    });
  }, [viewport]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return undefined;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!user) {
      return undefined;
    }

    const element = createUserLocationElement();
    const userPopup = new Popup({ offset: 14 }).setText("You are here.");
    const marker = new Marker({ element, anchor: "center" })
      .setLngLat([user.lng, user.lat])
      .setPopup(userPopup)
      .addTo(map);

    userMarkerRef.current = marker;

    return () => {
      marker.remove();
      if (userMarkerRef.current === marker) {
        userMarkerRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return undefined;
    }

    const nextMarkers = outlets.map(outlet => {
      const element = createSpotMarkerElement(outlet, false);
      const button = element.querySelector(".spot-marker");

      button.addEventListener("click", event => {
        event.stopPropagation();
        onSelectOutletRef.current(outlet);
      });

      const marker = new Marker({ element, anchor: "center" })
        .setLngLat([outlet.lng, outlet.lat])
        .addTo(map);

      return { id: outlet.id, marker, element, button };
    });

    spotMarkersRef.current = nextMarkers;

    return () => {
      for (const item of nextMarkers) {
        item.marker.remove();
      }
      spotMarkersRef.current = [];
    };
  }, [outlets]);

  useEffect(() => {
    for (const item of spotMarkersRef.current) {
      const isActive = item.id === activeOutletId;
      item.element.classList.toggle("spot-marker-wrap--active", isActive);
      item.button.classList.toggle("spot-marker--active", isActive);
    }
  }, [outlets, activeOutletId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return undefined;
    }

    for (const item of cityMarkersRef.current) {
      item.marker.remove();
    }
    cityMarkersRef.current = [];

    if (activeCity || outlets.length > 0 || !cityCatalog.length) {
      return undefined;
    }

    const nextCityMarkers = cityCatalog.map(city => {
      const element = createCityMarkerElement(city);
      const button = element.querySelector(".city-marker");

      button.addEventListener("click", event => {
        event.stopPropagation();
        onSelectCityRef.current(city);
      });

      const marker = new Marker({ element, anchor: "center" })
        .setLngLat([city.center[1], city.center[0]])
        .addTo(map);

      return { id: city.id, marker };
    });

    cityMarkersRef.current = nextCityMarkers;

    return () => {
      for (const item of nextCityMarkers) {
        item.marker.remove();
      }
      cityMarkersRef.current = [];
    };
  }, [activeCity, outlets.length, cityCatalog]);

  return (
    <>
      <div ref={containerRef} className="map-canvas" />

      <div className="map-info-wrap">
        {isLayerMenuOpen && (
          <div className="map-style-popover" role="dialog" aria-label="Map appearance">
            <p className="map-style-popover__title">Map style</p>
            <div className="map-style-options">
              {MAP_STYLES.map(styleOption => (
                <button
                  key={styleOption.id}
                  type="button"
                  className={`map-style-pill ${activeStyleId === styleOption.id ? "map-style-pill--active" : ""}`}
                  onClick={() => handleStyleChange(styleOption)}
                >
                  {styleOption.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`map-info-btn ${isLayerMenuOpen ? "map-info-btn--active" : ""}`}
          onClick={() => setIsLayerMenuOpen(prev => !prev)}
          aria-label="Toggle map style options"
          aria-expanded={isLayerMenuOpen}
          title="Map style"
        >
          i
        </button>
      </div>
    </>
  );
}
