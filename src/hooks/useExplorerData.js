import {
  CATEGORY_ALL_LABEL,
  DEFAULT_REFERENCE_POINT
} from "../constants/explorer";
import { getDistance } from "../utils/distance";

const NEAR_USER_THRESHOLD_KM = 60;

export function useExplorerData({
  cityCatalog,
  cityOutlets,
  activeCity,
  activeCategory,
  searchedArea,
  user
}) {
  const activeCityData = activeCity
    ? cityCatalog.find(city => city.id === activeCity) || null
    : null;

  const categories = [CATEGORY_ALL_LABEL];

  for (const outlet of cityOutlets) {
    if (!categories.includes(outlet.category)) {
      categories.push(outlet.category);
    }
  }

  const hasSearchWithoutData = Boolean(
    searchedArea && activeCity && !activeCityData
  );

  let areaPoint = DEFAULT_REFERENCE_POINT;

  if (searchedArea) {
    areaPoint = searchedArea;
  } else if (activeCityData) {
    areaPoint = {
      lat: activeCityData.center[0],
      lng: activeCityData.center[1],
      label: activeCityData.name
    };
  }

  const isUserNearArea = Boolean(
    user &&
      getDistance(user.lat, user.lng, areaPoint.lat, areaPoint.lng) <=
        NEAR_USER_THRESHOLD_KM
  );

  const referencePoint = isUserNearArea
    ? { lat: user.lat, lng: user.lng, label: "your location" }
    : areaPoint;

  const visibleOutlets = cityOutlets
    .filter(
      outlet =>
        activeCategory === CATEGORY_ALL_LABEL ||
        outlet.category === activeCategory
    )
    .map(outlet => {
      const areaDistanceKm = getDistance(
        areaPoint.lat,
        areaPoint.lng,
        outlet.lat,
        outlet.lng
      );
      const userDistanceKm = user
        ? getDistance(user.lat, user.lng, outlet.lat, outlet.lng)
        : null;

      return {
        ...outlet,
        distanceKm: userDistanceKm ?? areaDistanceKm,
        distanceReferenceLabel: user ? "you" : areaPoint.label,
        sortDistanceKm: isUserNearArea ? userDistanceKm : areaDistanceKm
      };
    })
    .sort((left, right) => left.sortDistanceKm - right.sortDistanceKm);

  return {
    activeCityData,
    categories,
    visibleOutlets,
    referencePoint,
    hasSearchWithoutData
  };
}
