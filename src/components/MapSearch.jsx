import { useEffect, useRef, useState } from "react";

import { getResultCityName, normalizeCityName } from "../utils/city";

export default function MapSearch({
  cityOptions,
  searchableOutlets,
  onPlaceSelect,
  onSelectSpot
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const query = searchText.trim().toLowerCase();

  const matchingCities = query
    ? cityOptions.filter(city => city.name.toLowerCase().includes(query)).slice(0, 4)
    : cityOptions.slice(0, 5);

  const matchingSpots = query
    ? searchableOutlets
        .filter(outlet => {
          const haystack = `${outlet.name} ${outlet.neighborhood} ${outlet.category} ${outlet.bestItem} ${outlet.city}`.toLowerCase();
          return haystack.includes(query);
        })
        .slice(0, 6)
    : [];

  async function searchPlace() {
    const trimmedSearch = searchText.trim();
    if (!trimmedSearch || isSearching) {
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const normalizedQuery = normalizeCityName(trimmedSearch);
      const localCityMatch = cityOptions.find(city => city.id === normalizedQuery);

      if (localCityMatch) {
        onPlaceSelect({
          lat: localCityMatch.center[0],
          lng: localCityMatch.center[1],
          city: localCityMatch.name,
          label: localCityMatch.name
        });
        setIsOpen(false);
        return;
      }

      if (matchingSpots.length === 1) {
        onSelectSpot(matchingSpots[0]);
        setIsOpen(false);
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
          setIsOpen(false);
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
        setError("No place found. Try Bengaluru, Mumbai, or a neighborhood.");
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
      setIsOpen(false);
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

  const showDropdown =
    isOpen && (matchingCities.length > 0 || matchingSpots.length > 0 || query.length > 0 || Boolean(error));

  return (
    <div ref={containerRef} className="top-search-wrap">
      <form className="search-pill" onSubmit={handleSubmit}>
        <svg
          className="search-pill__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search places"
          value={searchText}
          onFocus={() => setIsOpen(true)}
          onChange={event => {
            setSearchText(event.target.value);
            setIsOpen(true);
            if (error) setError("");
          }}
          onKeyDown={event => {
            if (event.key === "Escape") {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          aria-label="Search places, cities, or hidden food spots"
        />

        {searchText && (
          <button
            type="button"
            className="search-pill__clear"
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
      </form>

      {showDropdown && (
        <div className="search-dropdown" role="listbox" aria-label="Search suggestions">
          {error && <p className="search-dropdown__error">{error}</p>}

          {matchingSpots.length > 0 && (
            <div className="search-dropdown__group">
              <p className="search-dropdown__label">Hidden spots</p>
              {matchingSpots.map(spot => (
                <button
                  key={spot.id}
                  type="button"
                  className="search-dropdown__item"
                  onClick={() => {
                    onSelectSpot(spot);
                    setSearchText(spot.name);
                    setIsOpen(false);
                  }}
                >
                  <span className="search-dropdown__title">{spot.name}</span>
                  <span className="search-dropdown__meta">
                    {spot.neighborhood}, {spot.city} · {spot.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchingCities.length > 0 && (
            <div className="search-dropdown__group">
              <p className="search-dropdown__label">
                {query ? "Cities" : "Curated cities"}
              </p>
              {matchingCities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  className="search-dropdown__item"
                  onClick={() => {
                    onPlaceSelect({
                      lat: city.center[0],
                      lng: city.center[1],
                      city: city.name,
                      label: city.name
                    });
                    setSearchText(city.name);
                    setIsOpen(false);
                  }}
                >
                  <span className="search-dropdown__title">{city.name}</span>
                  <span className="search-dropdown__meta">{city.count} curated spots</span>
                </button>
              ))}
            </div>
          )}

          {query && (
            <button
              type="button"
              className="search-dropdown__item search-dropdown__item--action"
              onClick={searchPlace}
              disabled={isSearching}
            >
              <span className="search-dropdown__title">
                {isSearching ? `Searching "${searchText.trim()}"...` : `Find "${searchText.trim()}" on map`}
              </span>
              <span className="search-dropdown__meta">Press Enter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
