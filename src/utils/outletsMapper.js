import { normalizeCityName } from "./city.js";

export const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 38.0,
  minLng: 68.0,
  maxLng: 98.0
};

export const VALID_PRICE_RANGES = ["₹", "₹₹", "₹₹₹"];

export function isWithinIndiaBounds(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
}

export function createOutletSlug(name, citySlug) {
  const base = `${name || "spot"}-${citySlug || "india"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "spot"}-${suffix}`;
}

export function formatCurrentMonthYear(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric"
  });
}

export function mapRowToOutlet(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    citySlug: row.city_slug || normalizeCityName(row.city),
    neighborhood: row.neighborhood,
    lat: Number(row.lat),
    lng: Number(row.lng),
    category: row.category,
    priceRange: row.price_range || row.priceRange || "₹₹",
    knownFor: row.known_for || row.knownFor || "",
    bestItem: row.best_item || row.bestItem || "",
    vibe: row.vibe || "",
    whyUnderrated: row.why_underrated || row.whyUnderrated || "",
    curatedBy: row.curated_by || row.curatedBy || "Community",
    lastVerified: row.last_verified || row.lastVerified || "",
    tags: Array.isArray(row.tags) ? row.tags : []
  };
}

export function parseTagsInput(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags
      .map(tag => String(tag).trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  return String(rawTags || "")
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function validateOutletSubmission(form) {
  const errors = {};
  const name = (form.name || "").trim();
  const city = (form.city || "").trim();
  const neighborhood = (form.neighborhood || "").trim();
  const category = (form.category || "").trim();
  const bestItem = (form.bestItem || "").trim();
  const knownFor = (form.knownFor || "").trim();
  const vibe = (form.vibe || "").trim();
  const whyUnderrated = (form.whyUnderrated || "").trim();
  const curatedBy = (form.curatedBy || "").trim();
  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (form.honeypot) {
    errors.form = "Submission could not be processed.";
    return { valid: false, errors };
  }

  if (name.length < 2 || name.length > 120) {
    errors.name = "Enter the spot name (2–120 characters).";
  }

  if (city.length < 2) {
    errors.city = "Pick a city or search the place on the map.";
  }

  if (neighborhood.length < 2) {
    errors.neighborhood = "Enter the neighborhood or area.";
  }

  if (!isWithinIndiaBounds(lat, lng)) {
    errors.location = "Place the pin within India on the map.";
  }

  if (category.length < 2) {
    errors.category = "Select a category.";
  }

  if (!VALID_PRICE_RANGES.includes(form.priceRange)) {
    errors.priceRange = "Choose a price range.";
  }

  if (bestItem.length < 2) {
    errors.bestItem = "Share the best dish or drink to order.";
  }

  if (knownFor.length < 3) {
    errors.knownFor = "Briefly describe what this spot is known for.";
  }

  if (vibe.length < 2) {
    errors.vibe = "Describe the vibe in a few words.";
  }

  if (whyUnderrated.length < 20) {
    errors.whyUnderrated =
      "Share why locals love it (at least 20 characters so curation stays helpful).";
  }

  if (curatedBy && (curatedBy.length < 2 || curatedBy.length > 60)) {
    errors.curatedBy = "Name/handle should be 2–60 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function mapSubmissionToRow(form) {
  const city = form.city.trim();
  const citySlug = normalizeCityName(city);
  const name = form.name.trim();
  const tags = parseTagsInput(form.tags);

  return {
    id: createOutletSlug(name, citySlug),
    name,
    city,
    city_slug: citySlug,
    neighborhood: form.neighborhood.trim(),
    lat: Number(form.lat),
    lng: Number(form.lng),
    category: form.category.trim(),
    price_range: form.priceRange,
    known_for: form.knownFor.trim(),
    best_item: form.bestItem.trim(),
    vibe: form.vibe.trim(),
    why_underrated: form.whyUnderrated.trim(),
    curated_by: (form.curatedBy || "").trim() || "Community",
    last_verified: formatCurrentMonthYear(),
    tags: tags.length ? tags : [form.category.trim()],
    status: "pending"
  };
}
