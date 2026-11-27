import { useEffect, useState } from "react";

import { outlets as localOutlets } from "../data/outlets";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  fetchCitySummaries,
  fetchOutletsByCity
} from "../services/outletsService";
import { buildCityCatalog } from "../utils/city";

const initialLocalCatalog = buildCityCatalog(localOutlets);

export function useOutlets(activeCity) {
  const [cityCatalog, setCityCatalog] = useState(() =>
    isSupabaseConfigured ? [] : initialLocalCatalog.cityCatalog
  );
  const [totalOutlets, setTotalOutlets] = useState(() =>
    isSupabaseConfigured ? 0 : localOutlets.length
  );
  const [cityCache, setCityCache] = useState({});
  const [loadingCity, setLoadingCity] = useState(null);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      try {
        const result = await fetchCitySummaries();
        if (!isCancelled) {
          setCityCatalog(result.cityCatalog);
          setTotalOutlets(result.totalOutlets);
          if (result.warning) {
            setDataError("Live database unreachable; showing curated offline list.");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setDataError(err.message || "Unable to load curated cities.");
        }
      }
    }

    loadSummary();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeCity || cityCache[activeCity]) {
      return undefined;
    }

    let isCancelled = false;

    async function loadCity() {
      setLoadingCity(activeCity);
      setDataError("");

      try {
        const spots = await fetchOutletsByCity(activeCity);
        if (!isCancelled) {
          setCityCache(prev => ({
            ...prev,
            [activeCity]: spots
          }));
        }
      } catch (err) {
        if (!isCancelled) {
          setDataError(err.message || "Unable to load spots for this city.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingCity(current => (current === activeCity ? null : current));
        }
      }
    }

    loadCity();

    return () => {
      isCancelled = true;
    };
  }, [activeCity, cityCache]);

  const cityOutlets = activeCity ? cityCache[activeCity] || [] : [];
  const isLoadingCity = Boolean(activeCity && loadingCity === activeCity);

  return {
    cityCatalog,
    totalOutlets,
    cityOutlets,
    isLoadingCity,
    dataError,
    isLiveBackend: isSupabaseConfigured
  };
}
