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
  source: "google" | "osm";
}

export interface SearchChurchesInput {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

export interface GeocodeInput {
  query: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

// In-memory cache to prevent redundant API calls and control costs (TTL: 10 minutes)
interface CacheEntry {
  timestamp: number;
  data: Church[];
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

/**
 * Searches nearby churches using Google Places API (New) with strict field masks
 * or falls back to OpenStreetMap Nominatim if key is missing or quota is exceeded.
 */
export const searchNearbyChurchesFn = createServerFn({ method: "GET" })
  .validator((data: SearchChurchesInput) => {
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    const radius = Math.min(Math.max(Number(data.radiusMeters || 10000), 1000), 50000);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Coordenadas geográficas inválidas.");
    }

    return {
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
    };
  })
  .handler(async ({ data }): Promise<{ churches: Church[]; source: "google" | "osm"; cached?: boolean }> => {
    const { latitude, longitude, radiusMeters } = data;

    // 1. Check in-memory cache (~100m precision)
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}_${radiusMeters}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { churches: cached.data, source: cached.data[0]?.source || "osm", cached: true };
    }

    const apiKey = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_GOOGLE_MAPS_API_KEY"];

    // 2. Try Google Places API (New) if API key is configured
    if (apiKey) {
      try {
        const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.regularOpeningHours,places.nationalPhoneNumber,places.googleMapsUri,places.websiteUri",
          },
          body: JSON.stringify({
            includedTypes: ["church", "place_of_worship"],
            maxResultCount: 20,
            rankPreference: "DISTANCE",
            locationRestriction: {
              circle: {
                center: {
                  latitude,
                  longitude,
                },
                radius: radiusMeters,
              },
            },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const rawPlaces = json.places || [];

          const churches: Church[] = rawPlaces.map((p: any) => {
            const pLat = p.location?.latitude || latitude;
            const pLng = p.location?.longitude || longitude;
            const dist = calculateDistanceKm(latitude, longitude, pLat, pLng);

            return {
              id: p.id || `google-${Math.random().toString(36).slice(2)}`,
              name: p.displayName?.text || "Igreja",
              address: p.formattedAddress || "Endereço disponível no mapa",
              latitude: pLat,
              longitude: pLng,
              distanceKm: dist,
              rating: typeof p.rating === "number" ? p.rating : undefined,
              userRatingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : undefined,
              openNow: p.regularOpeningHours?.openNow,
              phoneNumber: p.nationalPhoneNumber,
              website: p.websiteUri,
              googleMapsUri: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text || "Igreja")}&query_place_id=${p.id}`,
              source: "google" as const,
            };
          });

          // Sort by distance ascending
          churches.sort((a, b) => a.distanceKm - b.distanceKm);

          // Save to cache
          cache.set(cacheKey, { timestamp: Date.now(), data: churches });
          return { churches, source: "google" };
        } else {
          console.warn("Google Places API (New) returned status:", response.status);
        }
      } catch (err) {
        console.warn("Error calling Google Places API (New), using fallback:", err);
      }
    }

    // 3. Fallback: OpenStreetMap Nominatim bounded church search
    try {
      const dLat = (radiusMeters / 1000) / 111.32;
      const dLon = (radiusMeters / 1000) / (111.32 * Math.cos((latitude * Math.PI) / 180));

      const minLon = longitude - dLon;
      const maxLon = longitude + dLon;
      const minLat = latitude - dLat;
      const maxLat = latitude + dLat;

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=igreja&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=25&addressdetails=1`;

      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "BibliaOnline/1.0 (contato@bibliaonline.me)",
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const items = await res.json();
        const churches: Church[] = (Array.isArray(items) ? items : []).map((item: any) => {
          const pLat = parseFloat(item.lat);
          const pLng = parseFloat(item.lon);
          const dist = calculateDistanceKm(latitude, longitude, pLat, pLng);
          const rawName = item.name || item.display_name?.split(",")[0] || "Igreja";

          return {
            id: `osm-${item.place_id || Math.random().toString(36).slice(2)}`,
            name: rawName,
            address: item.display_name || "Endereço no mapa",
            latitude: pLat,
            longitude: pLng,
            distanceKm: dist,
            googleMapsUri: `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}`,
            source: "osm" as const,
          };
        });

        // Sort by distance ascending
        churches.sort((a, b) => a.distanceKm - b.distanceKm);

        // Filter to ensure results are inside the requested radius
        const maxKm = radiusMeters / 1000;
        const filtered = churches.filter((c) => c.distanceKm <= maxKm * 1.15);

        // Save to cache
        cache.set(cacheKey, { timestamp: Date.now(), data: filtered });
        return { churches: filtered, source: "osm" };
      }
    } catch (fallbackErr) {
      console.error("Fallback OSM search error:", fallbackErr);
    }

    return { churches: [], source: "osm" };
  });

/**
 * Geocodes an address, city, or neighborhood string into geographic coordinates.
 */
export const geocodeAddressFn = createServerFn({ method: "GET" })
  .validator((data: GeocodeInput) => {
    const q = String(data.query || "").trim().slice(0, 150);
    if (!q || q.length < 2) {
      throw new Error("Por favor, digite uma cidade, bairro ou endereço válido.");
    }
    return { query: q };
  })
  .handler(async ({ data }): Promise<GeocodeResult> => {
    const { query } = data;
    const apiKey = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_GOOGLE_MAPS_API_KEY"];

    // 1. Try Google Geocoding API if key is present
    if (apiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR&region=br`;
        const res = await fetch(googleUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.results && json.results.length > 0) {
            const first = json.results[0];
            return {
              latitude: first.geometry.location.lat,
              longitude: first.geometry.location.lng,
              displayName: first.formatted_address || query,
            };
          }
        }
      } catch (err) {
        console.warn("Google Geocoding error, falling back to Nominatim:", err);
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=br`;
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
          };
        }
      }
    } catch (nomErr) {
      console.error("Nominatim geocode error:", nomErr);
    }

    throw new Error(`Não encontramos nenhuma localização para "${query}". Tente especificar a cidade e estado.`);
  });
