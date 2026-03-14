import { useEffect, useState } from "react";

import { GEOLOCATION_STATUS } from "../constants/explorer";

function canUseGeolocation() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function useCurrentLocation() {
  const [user, setUser] = useState(null);
  const [locationState, setLocationState] = useState(() =>
    canUseGeolocation() ? GEOLOCATION_STATUS.LOADING : GEOLOCATION_STATUS.UNSUPPORTED
  );

  useEffect(() => {
    if (!canUseGeolocation()) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setUser({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationState(GEOLOCATION_STATUS.READY);
      },
      () => {
        setLocationState(GEOLOCATION_STATUS.DENIED);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  }, []);

  return {
    user,
    locationState
  };
}
