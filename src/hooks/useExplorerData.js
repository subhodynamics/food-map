import {
  CATEGORY_ALL_LABEL,
  DEFAULT_REFERENCE_POINT
} from "../constants/explorer";
import { getDistance } from "../utils/distance";
import { buildCityCatalog, normalizeCityName } from "../utils/city";

export function useExplorerData({ outlets, activeCity, activeCategory, searchedArea }) {
  const { cityCatalog, cityMap } = buildCityCatalog(outlets);

  const cityOutlets = activeCity
    ? outlets.filter(outlet => normalizeCityName(outlet.city) === activeCity)
    : [];

  const categories = [CATEGORY_ALL_LABEL];

  for (const outlet of cityOutlets) {
    if (!categories.includes(outlet.category)) {
      categories.push(outlet.category);
    }
  }

  const activeCityData = activeCity ? cityMap[activeCity] || null : null;
  const hasSearchWithoutData = Boolean(searchedArea && activeCity && !activeCityData);

  let referencePoint = DEFAULT_REFERENCE_POINT;

  if (searchedArea) {
    referencePoint = searchedArea;
  } else if (activeCityData) {
    referencePoint = {
      lat: activeCityData.center[0],
      lng: activeCityData.center[1],
      label: activeCityData.name
    };
  }

  const visibleOutlets = cityOutlets
    .filter(outlet => activeCategory === CATEGORY_ALL_LABEL || outlet.category === activeCategory)
    .map(outlet => ({
      ...outlet,
      distanceKm: getDistance(referencePoint.lat, referencePoint.lng, outlet.lat, outlet.lng)
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);

  return {
    cityCatalog,
    activeCityData,
    categories,
    visibleOutlets,
    referencePoint,
    hasSearchWithoutData
  };
}
