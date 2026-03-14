import { useEffect, useRef, useState } from "react";

import { getResultCityName, normalizeCityName } from "../utils/city";

export default function MapSearch({ cityOptions, onPlaceSelect }) {
  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [isFirstSearch, setIsFirstSearch] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFirstSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFirstSearch]);

  async function searchPlace() {
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch || isSearching) {
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const normalizedQuery = normalizeCityName(trimmedSearch);
      const localMatch = cityOptions.find(city => city.id === normalizedQuery);

      if (localMatch) {
        onPlaceSelect({
          lat: localMatch.center[0],
          lng: localMatch.center[1],
          city: localMatch.name,
          label: localMatch.name
        });

        setIsFirstSearch(false);
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(trimmedSearch)}`
      );

      if (!response.ok) {
        throw new Error("Unable to search right now.");
      }

      const data = await response.json();

      if (!data.length) {
        setError("No city found. Try Bengaluru, Mumbai, Kolkata, or Pune.");
        return;
      }

      const bestMatch = data[0];
      const detectedCity = getResultCityName(bestMatch, trimmedSearch);

      onPlaceSelect({
        lat: parseFloat(bestMatch.lat),
        lng: parseFloat(bestMatch.lon),
        city: detectedCity,
        label: bestMatch.display_name.split(",").slice(0, 2).join(", ")
      });

      setIsFirstSearch(false);
    } catch (searchError) {
      setError(searchError.message || "Search failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <>
      {isFirstSearch && <div className="map-dim-overlay" />}

      <div className={`search-box ${isFirstSearch ? "centered" : ""}`}>
        <div className="search-box__copy">
          <span className="search-box__eyebrow">Find a city</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Bengaluru, Mumbai, Kolkata..."
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            onKeyDown={event => event.key === "Enter" && searchPlace()}
          />
          {error && <p className="search-box__error">{error}</p>}
        </div>
        <button type="button" onClick={searchPlace} disabled={isSearching}>
          {isSearching ? "..." : "Go"}
        </button>
      </div>
    </>
  );
}
