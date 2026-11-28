import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";

import { submitOutlet } from "../services/outletsService";
import {
  VALID_PRICE_RANGES,
  validateOutletSubmission
} from "../utils/outletsMapper";

const CATEGORIES = [
  "Coffee",
  "Bakery",
  "Breakfast",
  "Street Food",
  "South Indian",
  "Coastal",
  "Irani Cafe",
  "Biryani",
  "Mughlai",
  "Continental",
  "Bengali",
  "Asian",
  "Tibetan",
  "Italian",
  "Desserts"
];

const MINI_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const DEFAULT_PIN_CENTER = [12.9716, 77.5946];

function createInitialForm(initialCity, initialCenter) {
  const center = initialCenter || DEFAULT_PIN_CENTER;
  return {
    name: "",
    city: initialCity || "Bengaluru",
    neighborhood: "",
    lat: Number(center[0]).toFixed(6),
    lng: Number(center[1]).toFixed(6),
    category: "Coffee",
    priceRange: "₹₹",
    bestItem: "",
    knownFor: "",
    vibe: "",
    whyUnderrated: "",
    tags: "",
    curatedBy: "",
    honeypot: ""
  };
}

export default function AddSpotModal({
  isOpen,
  initialCity,
  initialCenter,
  isLiveBackend,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [form, setForm] = useState(() =>
    createInitialForm(initialCity, initialCenter)
  );
  const [lookupQuery, setLookupQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSpot, setSubmittedSpot] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setForm(createInitialForm(initialCity, initialCenter));
    setLookupQuery("");
    setLookupError("");
    setFieldErrors({});
    setSubmitError("");
    setSubmittedSpot(null);
  }, [isOpen, initialCity, initialCenter]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || submittedSpot) {
      return undefined;
    }

    const startLat = Number(form.lat) || DEFAULT_PIN_CENTER[0];
    const startLng = Number(form.lng) || DEFAULT_PIN_CENTER[1];

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: MINI_MAP_STYLE,
      center: [startLng, startLat],
      zoom: 13,
      attributionControl: false
    });

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    const marker = new Marker({ color: "#f06543", draggable: true })
      .setLngLat([startLng, startLat])
      .addTo(map);

    function syncPinCoords(lngLat) {
      setForm(prev => ({
        ...prev,
        lat: lngLat.lat.toFixed(6),
        lng: lngLat.lng.toFixed(6)
      }));
      setFieldErrors(prev => {
        if (!prev.location) return prev;
        const next = { ...prev };
        delete next.location;
        return next;
      });
    }

    marker.on("dragend", () => {
      syncPinCoords(marker.getLngLat());
    });

    map.on("click", event => {
      marker.setLngLat(event.lngLat);
      syncPinCoords(event.lngLat);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
    // Initialize picker map once per modal open; updates sync via markerRef/mapRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submittedSpot]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) {
      setSubmitError("");
    }
  }

  async function locatePlaceOnMap() {
    const query = lookupQuery.trim();
    if (!query || isLocating) {
      return;
    }

    setIsLocating(true);
    setLookupError("");

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(`${query}, India`)}&limit=1&lang=en`
      );

      if (!response.ok) {
        throw new Error("Could not look up that location right now.");
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature?.geometry?.coordinates?.length) {
        setLookupError("No match found. Try adding the neighborhood or city.");
        return;
      }

      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties || {};

      setForm(prev => ({
        ...prev,
        name: prev.name || props.name || "",
        city: props.city || props.county || props.state || prev.city,
        neighborhood: props.district || props.suburb || props.street || prev.neighborhood,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      }));

      if (markerRef.current && mapRef.current) {
        markerRef.current.setLngLat([lng, lat]);
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
      }
    } catch (err) {
      setLookupError(err.message || "Location lookup failed.");
    } finally {
      setIsLocating(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const { valid, errors } = validateOutletSubmission(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const created = await submitOutlet(form);
      setSubmittedSpot(created);
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setSubmitError(err.message || "Unable to submit right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-spot-title"
      onClick={onClose}
    >
      <div className="add-spot-modal" onClick={event => event.stopPropagation()}>
        <div className="add-spot-modal__head">
          <div>
            <p className="section-label">Community curation</p>
            <h2 id="add-spot-title">Add a hidden spot to OnSpot</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {!isLiveBackend && !submittedSpot && (
          <div className="modal-notice">
            Running on local offline data. Connect Supabase environment variables to
            save live community submissions.
          </div>
        )}

        {submittedSpot ? (
          <div className="modal-success">
            <p className="section-label">Submitted for review</p>
            <h3>Thanks! {submittedSpot.name} is in the queue.</h3>
            <p>
              To keep OnSpot free of spam and misplaced pins, new spots in{" "}
              <strong>{submittedSpot.city}</strong> go live as soon as they are
              reviewed.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="subtle-button"
                onClick={() => {
                  setForm(createInitialForm(initialCity, initialCenter));
                  setSubmittedSpot(null);
                }}
              >
                Add another spot
              </button>
              <button type="button" className="primary-button" onClick={onClose}>
                Back to map
              </button>
            </div>
          </div>
        ) : (
          <form className="add-spot-form" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="website"
              className="sr-honeypot"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.honeypot}
              onChange={event => updateField("honeypot", event.target.value)}
            />

            <div className="pin-picker-block">
              <div className="pin-picker-lookup">
                <input
                  type="text"
                  placeholder="Search spot or street to place pin (e.g. Indiranagar 12th Main)"
                  value={lookupQuery}
                  onChange={event => {
                    setLookupQuery(event.target.value);
                    if (lookupError) setLookupError("");
                  }}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      locatePlaceOnMap();
                    }
                  }}
                />
                <button
                  type="button"
                  className="subtle-button subtle-button--compact"
                  onClick={locatePlaceOnMap}
                  disabled={isLocating}
                >
                  {isLocating ? "Locating..." : "Locate pin"}
                </button>
              </div>
              {lookupError && <p className="form-error">{lookupError}</p>}

              <div ref={mapContainerRef} className="pin-picker-map" />
              <div className="pin-picker-coords">
                <span>Click map or drag the pin to the exact doorway</span>
                <code>
                  {form.lat}, {form.lng}
                </code>
              </div>
              {fieldErrors.location && (
                <p className="form-error">{fieldErrors.location}</p>
              )}
            </div>

            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Spot name *</span>
                <input
                  type="text"
                  placeholder="e.g. Champaca Bookstore & Cafe"
                  value={form.name}
                  onChange={event => updateField("name", event.target.value)}
                />
                {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
              </label>

              <label className="form-field">
                <span>City *</span>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={form.city}
                  onChange={event => updateField("city", event.target.value)}
                />
                {fieldErrors.city && <p className="form-error">{fieldErrors.city}</p>}
              </label>

              <label className="form-field">
                <span>Neighborhood *</span>
                <input
                  type="text"
                  placeholder="e.g. Vasanth Nagar"
                  value={form.neighborhood}
                  onChange={event => updateField("neighborhood", event.target.value)}
                />
                {fieldErrors.neighborhood && (
                  <p className="form-error">{fieldErrors.neighborhood}</p>
                )}
              </label>

              <label className="form-field">
                <span>Category *</span>
                <select
                  value={form.category}
                  onChange={event => updateField("category", event.target.value)}
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="form-error">{fieldErrors.category}</p>
                )}
              </label>

              <div className="form-field">
                <span>Price range *</span>
                <div className="price-pill-group">
                  {VALID_PRICE_RANGES.map(price => (
                    <button
                      key={price}
                      type="button"
                      className={`chip ${form.priceRange === price ? "chip--active" : ""}`}
                      onClick={() => updateField("priceRange", price)}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              <label className="form-field">
                <span>Best order *</span>
                <input
                  type="text"
                  placeholder="e.g. Cold smoked coffee"
                  value={form.bestItem}
                  onChange={event => updateField("bestItem", event.target.value)}
                />
                {fieldErrors.bestItem && (
                  <p className="form-error">{fieldErrors.bestItem}</p>
                )}
              </label>

              <label className="form-field">
                <span>Known for *</span>
                <input
                  type="text"
                  placeholder="e.g. Estate pour-overs & quiet corners"
                  value={form.knownFor}
                  onChange={event => updateField("knownFor", event.target.value)}
                />
                {fieldErrors.knownFor && (
                  <p className="form-error">{fieldErrors.knownFor}</p>
                )}
              </label>

              <label className="form-field form-field--full">
                <span>Vibe *</span>
                <input
                  type="text"
                  placeholder="e.g. Cozy, minimal, and unhurried"
                  value={form.vibe}
                  onChange={event => updateField("vibe", event.target.value)}
                />
                {fieldErrors.vibe && <p className="form-error">{fieldErrors.vibe}</p>}
              </label>

              <label className="form-field form-field--full">
                <span>
                  Why locals love it * ({form.whyUnderrated.trim().length}/20+ chars)
                </span>
                <textarea
                  rows={3}
                  placeholder="What makes this place special compared to loud hyped spots?"
                  value={form.whyUnderrated}
                  onChange={event => updateField("whyUnderrated", event.target.value)}
                />
                {fieldErrors.whyUnderrated && (
                  <p className="form-error">{fieldErrors.whyUnderrated}</p>
                )}
              </label>

              <label className="form-field">
                <span>Tags (comma-separated)</span>
                <input
                  type="text"
                  placeholder="Work-friendly, Quiet, Specialty beans"
                  value={form.tags}
                  onChange={event => updateField("tags", event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Your name or handle</span>
                <input
                  type="text"
                  placeholder="e.g. Subho or r/bangalore"
                  value={form.curatedBy}
                  onChange={event => updateField("curatedBy", event.target.value)}
                />
                {fieldErrors.curatedBy && (
                  <p className="form-error">{fieldErrors.curatedBy}</p>
                )}
              </label>
            </div>

            {submitError && <p className="form-error form-error--banner">{submitError}</p>}

            <div className="modal-actions">
              <button type="button" className="subtle-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit spot for review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
