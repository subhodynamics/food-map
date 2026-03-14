const CITY_STOP_WORDS = /\b(city|district|urban|rural|metropolitan|municipal|corporation|division|region)\b/g;

const CITY_ALIASES = {
  bangalore: "bengaluru",
  bombay: "mumbai",
  calcutta: "kolkata"
};

export function normalizeCityName(value) {
  const cleanedValue = (value || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(CITY_STOP_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();

  return CITY_ALIASES[cleanedValue] || cleanedValue;
}

export function getResultCityName(result, fallbackQuery) {
  const address = result.address || {};

  return (
    address.city ||
    address.town ||
    address.state_district ||
    address.county ||
    address.state ||
    fallbackQuery
  );
}

export function buildCityCatalog(outlets) {
  const cityCatalog = [];
  const cityMap = {};

  for (const outlet of outlets) {
    const cityId = normalizeCityName(outlet.city);
    const existingCity = cityMap[cityId];

    if (existingCity) {
      existingCity.latTotal += outlet.lat;
      existingCity.lngTotal += outlet.lng;
      existingCity.count += 1;
      continue;
    }

    const nextCity = {
      id: cityId,
      name: outlet.city,
      latTotal: outlet.lat,
      lngTotal: outlet.lng,
      count: 1
    };

    cityMap[cityId] = nextCity;
    cityCatalog.push(nextCity);
  }

  for (const city of cityCatalog) {
    city.center = [city.latTotal / city.count, city.lngTotal / city.count];
  }

  return {
    cityCatalog,
    cityMap
  };
}
