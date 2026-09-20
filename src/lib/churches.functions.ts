import { createServerFn } from "@tanstack/react-start";

export interface Church {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  phoneNumber?: string;
  website?: string;
  googleMapsUri?: string;
  primaryType?: string;
  primaryTypeDisplayName?: string;
  businessStatus?: string;
  source: "google" | "osm";
}

export interface SearchChurchesInput {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  query?: string;
  autoExpand?: boolean;
}

export interface SearchChurchesResponse {
  churches: Church[];
  source: "google" | "osm";
  effectiveRadiusMeters: number;
  expandedAutomatically?: boolean;
  cached?: boolean;
}

export interface GeocodeInput {
  query: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  searchTerm?: string;
}

// In-memory cache to prevent redundant API calls and control costs (TTL: 10 minutes)
interface CacheEntry {
  timestamp: number;
  data: SearchChurchesResponse;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Strict field mask for Google Places API (New)
const GOOGLE_PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.googleMapsUri",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.businessStatus",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.regularOpeningHours",
].join(",");

/**
 * Helper to call Google Places API (New) searchNearby
 */
async function fetchGooglePlacesNearby(
  apiKey: string,
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Promise<any[]> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: ["church", "place_of_worship"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.places || [];
    }
  } catch (e) {
    console.warn("fetchGooglePlacesNearby error:", e);
  }
  return [];
}

/**
 * Helper to call Google Places API (New) searchText
 */
async function fetchGooglePlacesText(
  apiKey: string,
  textQuery: string,
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Promise<any[]> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.places || [];
    }
  } catch (e) {
    console.warn("fetchGooglePlacesText error for query:", textQuery, e);
  }
  return [];
}

/**
 * Converts a raw Google Place into our Church interface.
 */
function mapGooglePlaceToChurch(p: any, originLat: number, originLng: number): Church | null {
  const pLat = p.location?.latitude;
  const pLng = p.location?.longitude;
  if (!pLat || !pLng) return null;

  // Exclude permanently closed venues
  if (p.businessStatus === "CLOSED_PERMANENTLY") return null;

  const dist = calculateDistanceKm(originLat, originLng, pLat, pLng);
  const name = p.displayName?.text || "Igreja";

  return {
    id: p.id || `google-${pLat}-${pLng}`,
    name,
    address: p.formattedAddress || "Endereço disponível no mapa",
    latitude: pLat,
    longitude: pLng,
    distanceKm: dist,
    rating: typeof p.rating === "number" ? p.rating : undefined,
    userRatingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : undefined,
    openNow: p.regularOpeningHours?.openNow,
    phoneNumber: p.nationalPhoneNumber,
    googleMapsUri:
      p.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${p.id}`,
    primaryType: p.primaryType,
    primaryTypeDisplayName: p.primaryTypeDisplayName?.text,
    businessStatus: p.businessStatus,
    source: "google",
  };
}

/**
 * Fallback: queries Nominatim for a specific keyword in a bounding box.
 */
async function fetchNominatimTerm(
  term: string,
  minLon: number,
  maxLat: number,
  maxLon: number,
  minLat: number,
): Promise<any[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      term,
    )}&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=25&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "BibliaOnline/1.0 (contato@bibliaonline.me)",
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const items = await res.json();
      return Array.isArray(items) ? items : [];
    }
  } catch (e) {
    console.warn("fetchNominatimTerm error for term:", term, e);
  }
  return [];
}

/**
 * Executes a comprehensive search for churches around coordinates
 */
async function executeChurchSearch(
  apiKey: string | undefined,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  query?: string,
): Promise<{ churches: Church[]; source: "google" | "osm" }> {
  // 1. If Google Maps API key is configured
  if (apiKey) {
    const placeMap = new Map<string, Church>();

    if (query && query.trim().length >= 2) {
      // User specified a custom search term (e.g. "igreja batista", "paroquia", "igrejas em Itaguai")
      const [textResults, nearbyResults] = await Promise.all([
        fetchGooglePlacesText(apiKey, query, latitude, longitude, radiusMeters),
        fetchGooglePlacesNearby(apiKey, latitude, longitude, radiusMeters),
      ]);

      [...textResults, ...nearbyResults].forEach((p) => {
        const church = mapGooglePlaceToChurch(p, latitude, longitude);
        if (church && !placeMap.has(church.id)) {
          placeMap.set(church.id, church);
        }
      });
    } else {
      // General discovery: combine Nearby Search + Text Search for diverse denominations
      // Primary search in parallel
      const [nearbyResults, textIgreja] = await Promise.all([
        fetchGooglePlacesNearby(apiKey, latitude, longitude, radiusMeters),
        fetchGooglePlacesText(apiKey, "igreja", latitude, longitude, radiusMeters),
      ]);

      [...nearbyResults, ...textIgreja].forEach((p) => {
        const church = mapGooglePlaceToChurch(p, latitude, longitude);
        if (church && !placeMap.has(church.id)) {
          placeMap.set(church.id, church);
        }
      });

      // If we have fewer than 10 results, execute complementary searches for other key denominations
      if (placeMap.size < 10) {
        const [evangelicaResults, catolicaResults, batistaResults] = await Promise.all([
          fetchGooglePlacesText(apiKey, "igreja evangélica", latitude, longitude, radiusMeters),
          fetchGooglePlacesText(apiKey, "paróquia", latitude, longitude, radiusMeters),
          fetchGooglePlacesText(apiKey, "assembleia de Deus", latitude, longitude, radiusMeters),
        ]);

        [...evangelicaResults, ...catolicaResults, ...batistaResults].forEach((p) => {
          const church = mapGooglePlaceToChurch(p, latitude, longitude);
          if (church && !placeMap.has(church.id)) {
            placeMap.set(church.id, church);
          }
        });
      }
    }

    if (placeMap.size > 0) {
      const maxKm = (radiusMeters / 1000) * 1.35; // allow reasonable boundary tolerance
      const list = Array.from(placeMap.values())
        .filter((c) => c.distanceKm <= maxKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return { churches: list, source: "google" };
    }
  }

  // 2. Resilient Fallback: OpenStreetMap Nominatim with multi-term search
  try {
    const dLat = (radiusMeters / 1000) / 111.32;
    const dLon = (radiusMeters / 1000) / (111.32 * Math.cos((latitude * Math.PI) / 180));

    const minLon = longitude - dLon;
    const maxLon = longitude + dLon;
    const minLat = latitude - dLat;
    const maxLat = latitude + dLat;

    const terms = query ? [query, "igreja"] : ["igreja", "paróquia", "assembleia de deus", "capela"];
    const resultsArrays = await Promise.all(
      terms.map((t) => fetchNominatimTerm(t, minLon, maxLat, maxLon, minLat)),
    );

    const osmMap = new Map<string, Church>();
    resultsArrays.flat().forEach((item: any) => {
      const pLat = parseFloat(item.lat);
      const pLng = parseFloat(item.lon);
      if (isNaN(pLat) || isNaN(pLng)) return;

      const id = `osm-${item.place_id || `${pLat}_${pLng}`}`;
      if (osmMap.has(id)) return;

      const dist = calculateDistanceKm(latitude, longitude, pLat, pLng);
      const rawName = item.name || item.display_name?.split(",")[0] || "Igreja";

      osmMap.set(id, {
        id,
        name: rawName,
        address: item.display_name || "Endereço no mapa",
        latitude: pLat,
        longitude: pLng,
        distanceKm: dist,
        googleMapsUri: `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}`,
        source: "osm",
      });
    });

    const maxKm = (radiusMeters / 1000) * 1.25;
    const list = Array.from(osmMap.values())
      .filter((c) => c.distanceKm <= maxKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { churches: list, source: "osm" };
  } catch (err) {
    console.error("OSM fallback search error:", err);
  }

  return { churches: [], source: "osm" };
}

/**
 * Searches nearby churches using Google Places API (New) + Text Search + progressive expansion
 */
export const searchNearbyChurchesFn = createServerFn({ method: "GET" })
  .validator((data: SearchChurchesInput) => {
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    const radius = Math.min(Math.max(Number(data.radiusMeters || 5000), 1000), 50000);
    const query = data.query ? String(data.query).trim().slice(0, 100) : undefined;
    const autoExpand = data.autoExpand !== false;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Coordenadas geográficas inválidas.");
    }

    return {
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      query,
      autoExpand,
    };
  })
  .handler(async ({ data }): Promise<SearchChurchesResponse> => {
    const { latitude, longitude, radiusMeters, query, autoExpand } = data;

    // Check in-memory cache
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}_${radiusMeters}_${query || "default"}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }

    const apiKey = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_GOOGLE_MAPS_API_KEY"];

    // 1. Initial search with requested radius (starts at 5 km)
    let { churches, source } = await executeChurchSearch(
      apiKey,
      latitude,
      longitude,
      radiusMeters,
      query,
    );

    let effectiveRadius = radiusMeters;
    let expandedAutomatically = false;

    // 2. Progressive auto-expansion:
    // If fewer than 5 results are found at 5 km, automatically broaden search to 10 km
    if (churches.length < 5 && radiusMeters <= 5000 && autoExpand) {
      const expandedRadius = 10000;
      const expanded = await executeChurchSearch(apiKey, latitude, longitude, expandedRadius, query);

      if (expanded.churches.length > churches.length) {
        churches = expanded.churches;
        source = expanded.source;
        effectiveRadius = expandedRadius;
        expandedAutomatically = true;
      }
    }

    // Limit to maximum 20 results initially (or up to 25 if expanded)
    const maxResults = effectiveRadius > 10000 ? 25 : 20;
    const finalChurches = churches.slice(0, maxResults);

    const response: SearchChurchesResponse = {
      churches: finalChurches,
      source,
      effectiveRadiusMeters: effectiveRadius,
      expandedAutomatically,
    };

    // Save to cache
    cache.set(cacheKey, { timestamp: Date.now(), data: response });
    return response;
  });

/**
 * Geocodes an address, city, or neighborhood string into geographic coordinates.
 * Cleans terms like "igrejas em ..." to accurately locate the city/neighborhood.
 */
export const geocodeAddressFn = createServerFn({ method: "GET" })
  .validator((data: GeocodeInput) => {
    const raw = String(data.query || "").trim().slice(0, 150);
    if (!raw || raw.length < 2) {
      throw new Error("Por favor, digite uma cidade, bairro ou endereço válido.");
    }
    return { query: raw };
  })
  .handler(async ({ data }): Promise<GeocodeResult> => {
    const rawQuery = data.query;
    const apiKey = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_GOOGLE_MAPS_API_KEY"];

    // Extract location term if query is formatted like "igrejas em Itaguaí"
    let cleanLocation = rawQuery
      .replace(/^igrejas?\s+(em|no|na|de|perto\s+de)\s+/i, "")
      .replace(/^templos?\s+(em|no|na|de)\s+/i, "")
      .replace(/^par[oó]quias?\s+(em|no|na|de)\s+/i, "")
      .trim();

    if (!cleanLocation) cleanLocation = rawQuery;

    // 1. Try Google Geocoding API if key is present
    if (apiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          cleanLocation,
        )}&key=${apiKey}&language=pt-BR&region=br`;
        const res = await fetch(googleUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.results && json.results.length > 0) {
            const first = json.results[0];
            return {
              latitude: first.geometry.location.lat,
              longitude: first.geometry.location.lng,
              displayName: first.formatted_address || cleanLocation,
              searchTerm: rawQuery,
            };
          }
        }
      } catch (err) {
        console.warn("Google Geocoding error, falling back to Nominatim:", err);
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanLocation,
      )}&limit=1&addressdetails=1&countrycodes=br`;
      const res = await fetch(nomUrl, {
        headers: {
          "User-Agent": "BibliaOnline/1.0 (contato@bibliaonline.me)",
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const item = list[0];
          return {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName: item.display_name,
            searchTerm: rawQuery,
          };
        }
      }
    } catch (nomErr) {
      console.error("Nominatim geocode error:", nomErr);
    }

    throw new Error(
      `Não encontramos nenhuma localização para "${rawQuery}". Tente especificar o nome da cidade e estado.`,
    );
  });
