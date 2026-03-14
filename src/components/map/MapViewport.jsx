import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapViewport({ viewport }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(viewport.center, viewport.zoom, {
      animate: true,
      duration: 1.2
    });
  }, [map, viewport]);

  return null;
}
