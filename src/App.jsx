import { MapContainer, TileLayer, Marker, Popup, Tooltip} from "react-leaflet";
import { useEffect, useState } from "react";
import MapSearch from "./components/MapSearch";
import "leaflet/dist/leaflet.css";
import "./styles/map.css";

import { redIcon, blueIcon } from "./assets/icons";
import { outlets } from "./data/outlets";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setUser({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  return (
    <MapContainer center={[22.5726, 88.3639]} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

      <MapSearch /> 

      {user && (
        <Marker position={[user.lat, user.lng]} icon={blueIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {outlets.map((o, i) => {
        const dist = user
          ? getDistance(user.lat, user.lng, o.lat, o.lng).toFixed(2)
          : null;

        return (
          <Marker
            key={i}
            position={[o.lat, o.lng]}
            icon={redIcon}
            eventHandlers={{
              click: () => setActiveMarker(i)
            }}
          >

            <Tooltip permanent direction="top" offset={[0, -25]}>
              {o.name}
            </Tooltip>

            {activeMarker === i && (
              <Popup
                autoClose={false}
                closeOnClick={false}
                onClose={() => setActiveMarker(null)}
              >
                <b>{o.name}</b><br />
                <b>Known for:</b> <i>{o.knownFor}</i><br /><br />

                {dist && <b>{dist} km away</b>}<br /><br />

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${o.lat},${o.lng}`}
                  target="_blank"
                >
                  Open in Google Maps
                </a>
              </Popup>
            )}

          </Marker>


        );
      })}
    </MapContainer>
  );
}
