import { createClient } from "@supabase/supabase-js";

import { outlets } from "../src/data/outlets.js";
import { normalizeCityName } from "../src/utils/city.js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing environment variables. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding."
  );
  process.exit(1);
}

if (serviceRoleKey.startsWith("sb_publishable_")) {
  console.error(
    "You passed the public publishable key (sb_publishable_...). Use the secret/service_role key (sb_secret_...) from Supabase Project Settings -> API Keys."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const rows = outlets.map(outlet => ({
  id: outlet.id,
  name: outlet.name,
  city: outlet.city,
  city_slug: normalizeCityName(outlet.city),
  neighborhood: outlet.neighborhood,
  lat: outlet.lat,
  lng: outlet.lng,
  category: outlet.category,
  price_range: outlet.priceRange,
  known_for: outlet.knownFor,
  best_item: outlet.bestItem,
  vibe: outlet.vibe,
  why_underrated: outlet.whyUnderrated,
  curated_by: outlet.curatedBy,
  last_verified: outlet.lastVerified,
  tags: outlet.tags,
  status: "approved"
}));

const { error } = await supabase.from("outlets").upsert(rows, { onConflict: "id" });

if (error) {
  console.error("Failed to seed outlets:", error.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} approved outlets into Supabase.`);
