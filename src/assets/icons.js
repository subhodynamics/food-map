import { getCategoryIconSvg, getCategoryTheme } from "../constants/categories";

export function createSpotMarkerElement(outlet, isActive) {
  const theme = getCategoryTheme(outlet.category);
  const wrapper = document.createElement("div");
  wrapper.className = `spot-marker-wrap ${isActive ? "spot-marker-wrap--active" : ""}`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = `spot-marker ${isActive ? "spot-marker--active" : ""}`;
  button.setAttribute("aria-label", `${outlet.name} in ${outlet.neighborhood}`);

  const badge = document.createElement("span");
  badge.className = "spot-marker__badge";
  badge.style.background = theme.markerBg;
  badge.innerHTML = getCategoryIconSvg(outlet.category, 18);

  const label = document.createElement("span");
  label.className = "spot-marker__label";
  label.textContent = outlet.name;

  button.appendChild(badge);
  button.appendChild(label);
  wrapper.appendChild(button);
  return wrapper;
}

export function createCityMarkerElement(city) {
  const wrapper = document.createElement("div");
  wrapper.className = "city-marker-wrap";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "city-marker";
  button.setAttribute("aria-label", `Explore ${city.name} (${city.count} spots)`);

  const count = document.createElement("span");
  count.className = "city-marker__count";
  count.textContent = String(city.count);

  const label = document.createElement("span");
  label.className = "city-marker__label";
  label.textContent = city.name;

  button.appendChild(count);
  button.appendChild(label);
  wrapper.appendChild(button);
  return wrapper;
}

export function createUserLocationElement() {
  const wrapper = document.createElement("div");
  wrapper.className = "user-location-wrap";

  const dot = document.createElement("div");
  dot.className = "user-location-pin";
  dot.setAttribute("aria-label", "Your current location");

  wrapper.appendChild(dot);
  return wrapper;
}
