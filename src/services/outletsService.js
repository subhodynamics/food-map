import { outlets as localOutlets } from "../data/outlets";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { buildCityCatalog, normalizeCityName } from "../utils/city";
import {
  mapRowToOutlet,
  mapSubmissionToRow,
  validateOutletSubmission
} from "../utils/outletsMapper";

function getLocalCityOutlets(citySlug) {
  return localOutlets.filter(
    outlet => normalizeCityName(outlet.city) === citySlug
  );
}

export async function fetchCitySummaries() {
  if (!supabase) {
    const { cityCatalog } = buildCityCatalog(localOutlets);
    return {
      cityCatalog,
      totalOutlets: localOutlets.length,
      source: "local"
    };
  }

  const { data, error } = await supabase
    .from("outlets")
    .select("city, city_slug, lat, lng")
    .eq("status", "approved");

  if (error) {
    console.warn("Falling back to local dataset for city summaries:", error.message);
    const { cityCatalog } = buildCityCatalog(localOutlets);
    return {
      cityCatalog,
      totalOutlets: localOutlets.length,
      source: "local-fallback",
      warning: error.message
    };
  }

  const normalizedRows = (data || []).map(row => ({
    city: row.city,
    lat: Number(row.lat),
    lng: Number(row.lng)
  }));

  const { cityCatalog } = buildCityCatalog(normalizedRows);

  return {
    cityCatalog,
    totalOutlets: normalizedRows.length,
    source: "supabase"
  };
}

export async function fetchOutletsByCity(citySlug) {
  if (!citySlug) {
    return [];
  }

  if (!supabase) {
    return getLocalCityOutlets(citySlug);
  }

  const { data, error } = await supabase
    .from("outlets")
    .select("*")
    .eq("city_slug", citySlug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(`Falling back to local dataset for ${citySlug}:`, error.message);
    return getLocalCityOutlets(citySlug);
  }

  return (data || []).map(mapRowToOutlet);
}

export async function submitOutlet(form) {
  const { valid, errors } = validateOutletSubmission(form);

  if (!valid) {
    const validationError = new Error("Please fix the highlighted fields.");
    validationError.fieldErrors = errors;
    throw validationError;
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Community submissions require Supabase to be configured (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)."
    );
  }

  const row = mapSubmissionToRow(form);

  // Do not call .select() here because RLS only exposes status = 'approved' on SELECT.
  const { error } = await supabase.from("outlets").insert([row]);

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        `"${row.name}" in ${row.city} has already been submitted.`
      );
    }
    throw new Error(error.message || "Could not submit your spot right now.");
  }

  return {
    id: row.id,
    name: row.name,
    city: row.city
  };
}
