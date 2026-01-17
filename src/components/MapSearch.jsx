import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

export default function MapSearch() {
  const map = useMap();
  const inputRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [isFirstSearch, setIsFirstSearch] = useState(true);

  useEffect(() => {
    if (isFirstSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFirstSearch]);

  async function searchPlace() {
    if (!searchText) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`
    );

    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      map.flyTo([lat, lon], 13, {
        animate: true,
        duration: 1.5
      });

      setIsFirstSearch(false);
    }
  }

  return (
    <>
      {isFirstSearch && <div className="map-dim-overlay" />}

      <div className={`search-box ${isFirstSearch ? "centered" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Where do you wanna eat?"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && searchPlace()}
        />
        <button onClick={searchPlace}>⌕</button>
      </div>
    </>
  );
}
