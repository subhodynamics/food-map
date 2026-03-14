import { Marker, Popup, Tooltip } from "react-leaflet";

import { blueIcon, redIcon } from "../../assets/icons";
import { formatDistance } from "../../utils/distance";
import { getGoogleMapsSearchUrl } from "../../utils/maps";

function OutletPopup({ outlet }) {
  return (
    <div className="popup-card">
      <p className="popup-card__eyebrow">
        {outlet.neighborhood} · {outlet.category}
      </p>
      <h3>{outlet.name}</h3>
      <p className="popup-card__story">{outlet.whyUnderrated}</p>
      <p className="popup-card__detail">
        <strong>Known for:</strong> {outlet.knownFor}
      </p>
      <p className="popup-card__detail">
        <strong>Best order:</strong> {outlet.bestItem}
      </p>
      <div className="tag-row">
        {outlet.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="popup-card__footer">
        <span>{outlet.priceRange}</span>
        <span>{outlet.vibe}</span>
        <span>{formatDistance(outlet.distanceKm)}</span>
      </div>
      <a href={getGoogleMapsSearchUrl(outlet.lat, outlet.lng)} target="_blank" rel="noreferrer">
        Open in Google Maps
      </a>
    </div>
  );
}

export default function OutletMarkers({
  user,
  outlets,
  activeOutletId,
  onSelectOutlet,
  onClearSelection
}) {
  return (
    <>
      {user && (
        <Marker position={[user.lat, user.lng]} icon={blueIcon}>
          <Popup>You are here.</Popup>
        </Marker>
      )}

      {outlets.map(outlet => (
        <Marker
          key={outlet.id}
          position={[outlet.lat, outlet.lng]}
          icon={redIcon}
          eventHandlers={{
            click: () => onSelectOutlet(outlet.id)
          }}
        >
          <Tooltip direction="top" offset={[0, -22]}>
            {outlet.name}
          </Tooltip>

          {activeOutletId === outlet.id && (
            <Popup
              autoClose={false}
              closeOnClick={false}
              onClose={onClearSelection}
            >
              <OutletPopup outlet={outlet} />
            </Popup>
          )}
        </Marker>
      ))}
    </>
  );
}
