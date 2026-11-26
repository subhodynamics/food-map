const PIN_SVG = `
  <svg viewBox="0 0 34 42" width="34" height="42" aria-hidden="true">
    <path
      d="M17 1.5C8.99 1.5 2.5 7.99 2.5 16c0 10.17 12.22 22.3 13.11 23.16a1.98 1.98 0 0 0 2.78 0C19.28 38.3 31.5 26.17 31.5 16 31.5 7.99 25.01 1.5 17 1.5Z"
      fill="currentColor"
      stroke="#ffffff"
      stroke-width="2.4"
    />
    <circle cx="17" cy="15.5" r="6" fill="#111318" />
    <circle cx="17" cy="15.5" r="2.6" fill="#ffffff" />
  </svg>
`;

export function createSpotMarkerElement(outlet, isActive) {
  const wrapper = document.createElement("div");
  wrapper.className = `spot-marker-wrap ${isActive ? "spot-marker-wrap--active" : ""}`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = `spot-marker ${isActive ? "spot-marker--active" : ""}`;
  button.setAttribute("aria-label", `${outlet.name} in ${outlet.neighborhood}`);
  button.innerHTML = `${PIN_SVG}<span class="spot-marker__label"></span>`;
  button.querySelector(".spot-marker__label").textContent = outlet.name;

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
