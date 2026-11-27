export function getDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function formatDistance(distanceKm, referenceLabel = "you") {
  if (!Number.isFinite(distanceKm)) {
    return "";
  }

  let formatted;
  if (distanceKm < 1) {
    formatted = `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm >= 100) {
    formatted = `${Math.round(distanceKm).toLocaleString("en-IN")} km`;
  } else {
    formatted = `${distanceKm.toFixed(1)} km`;
  }

  return referenceLabel === "you"
    ? `${formatted} from you`
    : `${formatted} from ${referenceLabel}`;
}
