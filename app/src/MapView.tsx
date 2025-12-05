"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Clock, Navigation } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  name?: string;
  direction?: string;
}

interface MapViewProps {
  lastVisit?: Location | null;
  newVisit: Location;
  onRouteLoaded?: () => void;
  onTimeCalculated?: (eta: string) => void;
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
}

export function MapView({
  lastVisit,
  newVisit,
  onRouteLoaded,
  onTimeCalculated,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const wazeUrl = lastVisit
    ? `https://www.waze.com/es/live-map/directions?navigate=yes&to=ll.${newVisit.lat}%2C${newVisit.lng}&from=ll.${lastVisit.lat}%2C${lastVisit.lng}`
    : `https://www.waze.com/es/live-map/directions?navigate=yes&to=ll.${newVisit.lat}%2C${newVisit.lng}`;

  useEffect(() => {
    let mounted = true;

    const ensureMapboxCss = () => {
      if (document.getElementById("mapbox-gl-css")) return;
      const link = document.createElement("link");
      link.id = "mapbox-gl-css";
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      document.head.appendChild(link);
    };

    const init = async () => {
      if (!mapContainerRef.current) return;

      ensureMapboxCss();

      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }

      const center: [number, number] = lastVisit
        ? [lastVisit.lng, lastVisit.lat]
        : [newVisit.lng, newVisit.lat];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom: lastVisit ? 13 : 15,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      const createMarker = (bg: string, color: string) => {
        const el = document.createElement("div");
        el.style.width = "36px";
        el.style.height = "36px";
        el.style.borderRadius = "50%";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.background = bg;
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 3px 10px rgba(0,0,0,0.3)";
        el.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `;
        return el;
      };

      map.on("load", async () => {
        if (!mounted) return;

        if (lastVisit) {
          new mapboxgl.Marker({
            element: createMarker("#3b82f6", "white"),
            anchor: "bottom",
          })
            .setLngLat([lastVisit.lng, lastVisit.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="color: #000"><strong>Última Visita</strong><br/>${lastVisit.name ?? "</div>"}`
              )
            )
            .addTo(map);
        }

        new mapboxgl.Marker({
          element: createMarker("#fcb900", "#1f2937"),
          anchor: "bottom",
        })
          .setLngLat([newVisit.lng, newVisit.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="color: #000"><strong>Nueva Visita</strong><br/>${newVisit.name ?? "</div>"}`
            )
          )
          .addTo(map);

        if (!lastVisit) {
          map.flyTo({ center: [newVisit.lng, newVisit.lat], zoom: 15 });
          setIsLoading(false);
          return;
        }

        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lastVisit.lng},${lastVisit.lat};${newVisit.lng},${newVisit.lat}?geometries=geojson&overview=full&access_token=${encodeURIComponent(
            token
          )}`;

          const resp = await fetch(url);
          const json = await resp.json();

          if (json?.routes?.[0]) {
            const route = json.routes[0];

            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route.geometry,
              },
            });

            map.addLayer({
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#fcb900", "line-width": 6 },
            });

            const coords = route.geometry.coordinates;
            const bounds = coords.reduce(
              (b: any, c: [number, number]) => b.extend(c),
              new (mapboxgl as any).LngLatBounds(coords[0], coords[0])
            );

            map.fitBounds(bounds, { padding: 40 });

            setDistance(route.distance / 1000);
            setDuration(formatDuration(route.duration));

            const eta = new Date(Date.now() + route.duration * 1000);
            onTimeCalculated?.(
              eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
            onRouteLoaded?.();
          }
        } catch (e) {
          console.error("Directions error:", e);
        } finally {
          setIsLoading(false);
        }
      });      
    };

    init();

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lastVisit?.lat, lastVisit?.lng, newVisit.lat, newVisit.lng]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center gap-6 mb-4 text-gray-900">
        {lastVisit && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Última Visita
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          Nueva Visita
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat icon={Navigation} label="Distancia" value={distance ? `${distance.toFixed(2)} km` : "—"} />
        <Stat icon={Clock} label="Tiempo Est." value={duration ?? "—"} />
      </div>
      <div className="flex-1 relative border rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 grid place-content-center bg-white/80 z-10">
            <div className="h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full min-h-[240px]" />
      </div>
      <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex justify-center gap-2 bg-[#33CCFF] hover:bg-[#1FB7E6] text-white py-2 rounded-lg">
        Abrir con Waze
      </a>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-gray-50 border rounded-lg p-3">
      <div className="flex items-center gap-2 text-sm text-gray-900">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}