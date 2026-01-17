import { useState } from "react";
import { useMap } from "react-leaflet";

export default function MapSearch() {
  const [searchText, setSearchText] = useState("");
  const map = useMap();

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
    } else {
      alert("Place not found");
    }
  }

  return (
    <div className="search-box">
            <input
            type="text"
            placeholder="Where do you wanna eat?"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchPlace()}
            />
            <button onClick={searchPlace}>⌕</button>
            </div>
    );
}
