import { useEffect, useRef, useState } from "react";

import { getResultCityName, normalizeCityName } from "../utils/city";

export default function MapSearch({ cityOptions, hasActiveArea, onPlaceSelect }) {
  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [isFirstSearch, setIsFirstSearch] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const isCentered = isFirstSearch && !hasActiveArea;

  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 961px)").matches;

    if (isCentered && isDesktop && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCentered]);

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

      const photonResponse = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmedSearch)}&limit=1&lang=en`
      );

      if (photonResponse.ok) {
        const photonData = await photonResponse.json();
        const feature = photonData.features?.[0];

        if (feature?.geometry?.coordinates?.length >= 2) {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties || {};
          const detectedCity =
            props.city || props.name || props.county || props.state || trimmedSearch;
          const labelParts = [props.name || props.city, props.state, props.country]
            .filter(Boolean)
            .slice(0, 2);

          onPlaceSelect({
            lat,
            lng,
            city: detectedCity,
            label: labelParts.join(", ") || detectedCity
          });

          setIsFirstSearch(false);
          return;
        }
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

  function handleSubmit(event) {
    event.preventDefault();
    searchPlace();
  }

  return (
    <>
      {isCentered && (
        <div
          className="map-dim-overlay"
          onClick={() => setIsFirstSearch(false)}
          aria-hidden="true"
        />
      )}

      <form className={`search-box ${isCentered ? "centered" : ""}`} onSubmit={handleSubmit}>
        <div className="search-box__copy">
          <span className="search-box__eyebrow">Find a city</span>
          <div className="search-box__input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Bengaluru, Mumbai, Kolkata..."
              value={searchText}
              onChange={event => {
                setSearchText(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={event => {
                if (event.key === "Escape" && isCentered) {
                  setIsFirstSearch(false);
                }
              }}
              aria-label="Search for a city"
            />
            {searchText && (
              <button
                type="button"
                className="search-box__clear"
                onClick={() => {
                  setSearchText("");
                  setError("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          {error && <p className="search-box__error">{error}</p>}
        </div>
        <button type="submit" className="search-box__submit" disabled={isSearching}>
          {isSearching ? "..." : "Go"}
        </button>
      </form>
    </>
  );
}
