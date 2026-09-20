import { useEffect, useRef, useState } from "react";
import type { Church } from "@/lib/churches.functions";
import { Navigation, MapPin, Star, Phone, Clock, ExternalLink } from "lucide-react";

interface ChurchMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  churches: Church[];
  selectedChurchId?: string | null;
  onSelectChurch?: (church: Church) => void;
  className?: string;
}

export function ChurchMap({
  userLocation,
  churches,
  selectedChurchId,
  onSelectChurch,
  className = "",
}: ChurchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Dynamic import of Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Prevent re-initialization on existing container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialLat = userLocation?.latitude ?? (churches[0]?.latitude || -23.5505);
      const initialLng = userLocation?.longitude ?? (churches[0]?.longitude || -46.6333);

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: userLocation ? 13 : 12,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and View when userLocation or churches change
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__selectChurch = (id: string) => {
        const found = churches.find((c) => c.id === id);
        if (found && onSelectChurch) {
          onSelectChurch(found);
        }
      };
    }

    if (!isLoaded || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // 1. Remove old church markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      // 2. Remove old user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      // 3. User Location Marker with soft pulsing blue pin
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <span style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background-color: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
          title: "Sua localização",
        }).addTo(map);

        userMarker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; text-align: center;">
            <p style="margin: 0; font-weight: 700; font-size: 13px; color: #1e3a8a;">📍 Você está aqui</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Sua localização aproximada</p>
          </div>
        `);

        userMarkerRef.current = userMarker;
      }

      // 4. Church Markers with elegant gold cross pins
      churches.forEach((church) => {
        const churchIcon = L.divIcon({
          className: "custom-church-pin",
          html: `
            <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: linear-space; background: #b45309; border: 2px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: #ffffff; cursor: pointer;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([church.latitude, church.longitude], {
          icon: churchIcon,
          title: church.name,
        }).addTo(map);

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          church.name + ", " + church.address
        )}`;

        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; max-width: 280px; padding: 4px 2px;">
            <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 16px; margin-top: 1px;">⛪</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.25;">${church.name}</h4>
            </div>
            <p style="margin: 4px 0 6px 0; font-size: 12px; color: #475569; line-height: 1.3;">📍 ${church.address}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 11px; font-weight: 600; color: #b45309;">
              <span>📏 ${church.distanceKm} km de distância</span>
              ${church.rating ? `<span style="display: inline-flex; align-items: center; gap: 2px;">⭐ ${church.rating.toFixed(1)}</span>` : ""}
            </div>
            <div style="padding-top: 8px; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button
                type="button"
                onclick="window.__selectChurch && window.__selectChurch('${church.id}')"
                style="display: flex; align-items: center; justify-content: center; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-size: 11px; font-weight: 600; padding: 6px 8px; border-radius: 6px; cursor: pointer; text-align: center;"
              >
                Ver detalhes
              </button>
              <a
                href="${directionsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="display: flex; align-items: center; justify-content: center; gap: 3px; background-color: #d97706; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 600; padding: 6px 8px; border-radius: 6px; text-align: center;"
              >
                🧭 Como chegar
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onSelectChurch) {
            onSelectChurch(church);
          }
        });

        markersRef.current[church.id] = marker;
      });

      // 5. Fit Bounds to encompass user and nearby churches
      if (churches.length > 0) {
        const boundsPoints: [number, number][] = churches.map((c) => [c.latitude, c.longitude]);
        if (userLocation) {
          boundsPoints.push([userLocation.latitude, userLocation.longitude]);
        }
        const bounds = L.latLngBounds(boundsPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else if (userLocation) {
        map.setView([userLocation.latitude, userLocation.longitude], 13);
      }
    });
  }, [isLoaded, userLocation, churches, onSelectChurch]);

  // Pan to selected church when selectedChurchId changes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedChurchId) return;

    const marker = markersRef.current[selectedChurchId];
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latLng, 15, { duration: 1.2 });
      marker.openPopup();
    }
  }, [isLoaded, selectedChurchId]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full min-h-[300px] z-0" tabIndex={0} aria-label="Mapa interativo de igrejas" />

      {/* Fallback & Initial Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 backdrop-blur-xs text-muted-foreground p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gold/10 text-gold mb-3 animate-pulse">
            <MapPin className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">Carregando mapa interativo...</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Preparando visualização de comunidades e rotas.
          </p>
        </div>
      )}

      {/* Map Helper Badge */}
      <div className="absolute top-3 left-3 z-[400] hidden sm:flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/60 text-[11px] font-medium text-muted-foreground shadow-xs pointer-events-none">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Navegação interativa ativa</span>
      </div>
    </div>
  );
}
