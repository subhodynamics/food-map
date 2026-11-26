import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  createSpotMarkerElement,
  createUserLocationElement
} from "../../assets/icons";
import { formatDistance } from "../../utils/distance";
import { getGoogleMapsDirectionsUrl } from "../../utils/maps";

const MAP_STYLES = [
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

function OutletPopup({ outlet }) {
  return (
    <div className="popup-card">
      <p className="popup-card__eyebrow">
        {outlet.neighborhood} · {outlet.category}
      </p>
      <h3>{outlet.name}</h3>
      <p className="popup-card__story">{outlet.whyUnderrated}</p>
      <p className="popup-card__detail">
        <strong>Known for:</strong> {outlet.knownFor}
      </p>
      <p className="popup-card__detail">
        <strong>Best order:</strong> {outlet.bestItem}
      </p>
      <div className="tag-row">
        {outlet.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="popup-card__footer">
        <span>{outlet.priceRange}</span>
        <span>{outlet.vibe}</span>
        <span>{formatDistance(outlet.distanceKm)}</span>
      </div>
      <p className="popup-card__detail">
        <strong>Curated by:</strong> {outlet.curatedBy}
      </p>
      <p className="popup-card__detail">
        <strong>Verified:</strong> {outlet.lastVerified}
      </p>
      <a
        href={getGoogleMapsDirectionsUrl(outlet.lat, outlet.lng)}
        target="_blank"
        rel="noreferrer"
      >
        Directions on GoogleMap
      </a>
    </div>
  );
}

export default function FoodMap({
  viewport,
  user,
  outlets,
  activeOutletId,
  onSelectOutlet,
  onClearSelection
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const hasMountedViewportRef = useRef(false);
  const hasFallbackStyleRef = useRef(false);
  const userMarkerRef = useRef(null);
  const spotMarkersRef = useRef([]);
  const popupRef = useRef(null);
  const isProgrammaticCloseRef = useRef(false);
  const onSelectOutletRef = useRef(onSelectOutlet);
  const onClearSelectionRef = useRef(onClearSelection);
  const [activeStyleId, setActiveStyleId] = useState(MAP_STYLES[0].id);
  const [popupElement] = useState(() => document.createElement("div"));

  onSelectOutletRef.current = onSelectOutlet;
  onClearSelectionRef.current = onClearSelection;

  const activeOutlet =
    outlets.find(outlet => outlet.id === activeOutletId) || null;

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

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("error", event => {
      const status = event?.error?.status;
      if (!hasFallbackStyleRef.current && !map.isStyleLoaded() && status && status >= 400) {
        hasFallbackStyleRef.current = true;
        map.setStyle(OSM_FALLBACK_STYLE);
      }
    });

    mapRef.current = map;

    return () => {
      if (popupRef.current) {
        isProgrammaticCloseRef.current = true;
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      hasMountedViewportRef.current = false;
    };
    // Initial center/zoom come from initial viewport; subsequent updates use flyTo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStyleChange(styleOption) {
    setActiveStyleId(styleOption.id);
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
      duration: 1100,
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
        onSelectOutletRef.current(outlet.id);
      });

      const marker = new Marker({ element, anchor: "bottom" })
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
      return;
    }

    if (popupRef.current) {
      isProgrammaticCloseRef.current = true;
      popupRef.current.remove();
      popupRef.current = null;
      isProgrammaticCloseRef.current = false;
    }

    if (!activeOutlet) {
      return;
    }

    const popup = new Popup({
      offset: [0, -44],
      closeOnClick: false,
      maxWidth: "min(300px, calc(100vw - 2.5rem))"
    })
      .setLngLat([activeOutlet.lng, activeOutlet.lat])
      .setDOMContent(popupElement)
      .addTo(map);

    popup.on("close", () => {
      if (!isProgrammaticCloseRef.current) {
        onClearSelectionRef.current();
      }
    });

    popupRef.current = popup;
  }, [activeOutlet, popupElement]);

  return (
    <>
      <div ref={containerRef} className="map-canvas" />
      <div className="map-style-switcher" role="group" aria-label="Map style">
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
      {activeOutlet && createPortal(<OutletPopup outlet={activeOutlet} />, popupElement)}
    </>
  );
}
