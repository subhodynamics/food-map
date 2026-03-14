export const DEFAULT_CENTER = [22.5937, 78.9629];

export const DEFAULT_VIEWPORT = {
  center: DEFAULT_CENTER,
  zoom: 5
};

export const DEFAULT_REFERENCE_POINT = {
  lat: DEFAULT_CENTER[0],
  lng: DEFAULT_CENTER[1],
  label: "India map"
};

export const CATEGORY_ALL_LABEL = "All";

export const GEOLOCATION_STATUS = {
  LOADING: "loading",
  READY: "ready",
  DENIED: "denied",
  UNSUPPORTED: "unsupported"
};
