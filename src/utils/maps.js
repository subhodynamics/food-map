export function getGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
