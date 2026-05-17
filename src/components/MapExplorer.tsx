"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon, type LatLngExpression, type Map as LeafletMap } from "leaflet";
import { ArrowRight, ChevronRight, LocateFixed, MapPinned, Minus, Plus, Search, Sliders } from "lucide-react";
import { useAppUI } from "@/components/AppShell";
import { getUiCopy } from "@/lib/ui-copy";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type WaterBody = {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  images: { url: string }[];
  fishSpecies: string[];
  createdAt: string;
};

type WaterSpot = {
  id: string;
  name: string;
  place: string;
  distance: string;
  description: string;
  fish: string[];
  catchCount: string;
  center: LatLngExpression;
  coordinates: [number, number];
  distanceKmFromUser?: number | null;
};

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} м`;
  }
  return `${distanceKm.toFixed(1)} км`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(from: [number, number], to: [number, number]) {
  const earthRadiusKm = 6371;
  const latitudeDifference = toRadians(to[0] - from[0]);
  const longitudeDifference = toRadians(to[1] - from[1]);
  const startLatitude = toRadians(from[0]);
  const endLatitude = toRadians(to[0]);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.sin(longitudeDifference / 2) ** 2 * Math.cos(startLatitude) * Math.cos(endLatitude);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function createSpotIcon(active: boolean) {
  return divIcon({
    className: "",
    html: `
      <div class="relative flex h-14 w-14 items-center justify-center">
        <div class="absolute inset-0 rounded-full ${active ? "bg-blue-600/10" : "bg-white/95"}"></div>
        <div class="relative flex h-12 w-12 items-center justify-center rounded-full border-4 ${
          active ? "border-blue-600 bg-blue-600 shadow-lg shadow-blue-600/25" : "border-blue-600 bg-white shadow-lg shadow-slate-900/10"
        }">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="h-6 w-6 ${active ? "text-white" : "text-blue-600"}">
            <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <circle cx="12" cy="11" r="2.25" fill="currentColor" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -18],
  });
}

function createLocationIcon() {
  return divIcon({
    className: "",
    html: `
      <div class="relative flex h-14 w-14 items-center justify-center">
        <div class="absolute inset-0 animate-pulse rounded-full bg-blue-500/20"></div>
        <div class="relative flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow-lg shadow-blue-600/30">
          <div class="h-3 w-3 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -18],
  });
}

function MapFocus({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 11, { duration: 0.8 });
    }
  }, [center, map]);
  return null;
}

function SpotPill({
  spot,
  active,
  onClick,
  showDistance = true,
}: {
  spot: WaterSpot;
  active: boolean;
  onClick: () => void;
  showDistance?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition",
        active
          ? "border-blue-200 bg-blue-50/80 shadow-sm"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold transition",
          active ? "border-blue-200 bg-white text-blue-600" : "border-slate-200 bg-slate-50 text-slate-500",
        ].join(" ")}
      >
        <MapPinned className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{spot.name}</span>
        <span className="block text-xs text-slate-500">{spot.place}</span>
        {showDistance ? <span className="mt-1 block text-xs text-blue-600">{spot.distance}</span> : null}
        <span className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
          {spot.fish.slice(0, 3).map((fish) => (
            <span key={fish} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {fish}
            </span>
          ))}
          {spot.fish.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">+{spot.fish.length - 3}</span>
          )}
        </span>
      </span>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
    </button>
  );
}

export default function MapExplorer() {
  const { theme, language } = useAppUI();
  const searchParams = useSearchParams();
  const copy = getUiCopy(language);
  
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyCenter, setNearbyCenter] = useState<[number, number] | null>(null);
  const [maxDistance, setMaxDistance] = useState(500);
  const [allSpots, setAllSpots] = useState<WaterSpot[]>([]);

  // Завантаження даних з API
  useEffect(() => {
    const fetchWaterBodies = async () => {
      try {
        const res = await fetch(`${API_URL}/api/water`);
        const data = await res.json();
        setWaterBodies(data);
        setSelectedSpotId(null);
      } catch (error) {
        console.error('Помилка завантаження водойм:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWaterBodies();
  }, []);

  // Конвертація водойм у формат для карти
  const fishingSpots: WaterSpot[] = useMemo(() => {
    return waterBodies.map((water) => {
      const [lng, lat] = water.location.coordinates;
      const center: LatLngExpression = [lat, lng];
      
      return {
        id: water._id,
        name: water.name,
        place: water.name,
        distance: "відстань не визначено",
        description: water.description || "Опис відсутній",
        fish: water.fishSpecies || [],
        catchCount: "0",
        center: center,
        coordinates: [lat, lng],
      };
    });
  }, [waterBodies]);

  useEffect(() => {
    setAllSpots(fishingSpots);
  }, [fishingSpots]);

  // Фільтрація водойм за відстанню
  const filteredSpots = useMemo(() => {
    const center = nearbyCenter ?? (userLocation ? (userLocation as [number, number]) : null);
    
    if (!center) {
      return allSpots;
    }

    return allSpots
      .map((spot) => ({
        ...spot,
        distanceKmFromUser: distanceKm(center, spot.coordinates),
      }))
      .filter((spot) => (spot.distanceKmFromUser ?? 999) <= maxDistance)
      .sort((left, right) => (left.distanceKmFromUser ?? 999) - (right.distanceKmFromUser ?? 999))
      .map((spot) => ({
        ...spot,
        distance: spot.distanceKmFromUser ? formatDistance(spot.distanceKmFromUser) : "невідомо",
      }));
  }, [allSpots, nearbyCenter, userLocation, maxDistance]);

  // Відображення водойм в сайдбарі
  const nearbySpots = useMemo(() => {
    return filteredSpots.slice(0, 15);
  }, [filteredSpots]);

  const selectedSpot = useMemo(() => {
    if (!selectedSpotId) return null;
    return filteredSpots.find((spot) => spot.id === selectedSpotId) ?? null;
  }, [selectedSpotId, filteredSpots]);

  // Автоматичний flyTo при виборі точки
  useEffect(() => {
    if (selectedSpot && mapInstance) {
      mapInstance.flyTo(selectedSpot.center, 12, { duration: 0.8 });
    }
  }, [selectedSpot, mapInstance]);

  // Використовуємо безкоштовні тайли OpenStreetMap + CartoDB
  const tileLayerUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileLayerAttribution = theme === "dark"
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationMessage(copy.map.locationUnsupported);
      return;
    }

    setLocationMessage(copy.map.locationReady);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: LatLngExpression = [position.coords.latitude, position.coords.longitude];

        setUserLocation(nextLocation);
        setNearbyCenter([position.coords.latitude, position.coords.longitude]);
        setLocationMessage(copy.map.locationSuccess);
        setIsLocating(false);
        mapInstance?.flyTo(nextLocation, 12, { duration: 0.8 });
      },
      () => {
        setIsLocating(false);
        setNearbyCenter([49.8397, 24.0297]);
        setLocationMessage(copy.map.locationDenied);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-slate-600">Завантаження карти...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 transition-colors duration-200 sm:px-6 lg:px-8 lg:py-8 dark:bg-slate-950">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">{copy.map.label}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          {copy.map.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          {copy.map.description}
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="grid min-h-[44rem] lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                placeholder={copy.map.searchPlaceholder}
                className="h-14 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                <Sliders className="h-4 w-4" />
                <span>Фільтр за відстанню: до {maxDistance} км</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10 км</span>
                  <span>100 км</span>
                  <span>300 км</span>
                  <span>500 км</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 text-center">
                  Знайдено: {filteredSpots.length} водойм
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                Водойми в межах {maxDistance} км
              </div>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {nearbySpots.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Немає водойм в межах {maxDistance} км
                  </div>
                ) : (
                  nearbySpots.map((spot) => (
                    <SpotPill
                      key={spot.id}
                      spot={spot}
                      active={spot.id === selectedSpotId}
                      onClick={() => setSelectedSpotId(spot.id)}
                      showDistance={!!nearbyCenter || !!userLocation}
                    />
                  ))
                )}
              </div>
            </div>

            {selectedSpot && (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
                      Активна точка
                    </p>
                    <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{selectedSpot.name}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-4">{selectedSpot.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSpot.fish.map((fish) => (
                    <span key={fish} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                      {fish}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/wiki?water=${selectedSpot.id}`}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Деталі водойми
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </aside>

          <div className="relative isolate min-h-[38rem] overflow-hidden bg-sky-50 lg:min-h-[44rem] dark:bg-slate-950">
            {fishingSpots.length > 0 ? (
              <MapContainer
                center={[49.8397, 24.0297]}
                zoom={7.5}
                zoomControl={false}
                className="h-full w-full"
                ref={setMapInstance}
              >
                <TileLayer
                  attribution={tileLayerAttribution}
                  url={tileLayerUrl}
                />
                
                {filteredSpots.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={spot.center}
                    icon={createSpotIcon(spot.id === selectedSpotId)}
                    eventHandlers={{ click: () => setSelectedSpotId(spot.id) }}
                  />
                ))}

                {userLocation ? (
                  <Marker position={userLocation} icon={createLocationIcon()}>
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-slate-900">{copy.map.youAreHere}</p>
                        <p className="text-slate-600">{copy.map.currentLocationBrowser}</p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-slate-500">Немає даних для відображення</div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0))]" />

            <div className="absolute left-5 top-5 z-[600] max-w-sm rounded-3xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">{copy.map.mapTitle}</p>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">
                {selectedSpot?.name || "Виберіть водойму"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
                {selectedSpot?.description || "Натисніть на маркер на карті або виберіть водойму зі списку"}
              </p>

              {selectedSpot && (
                <>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedSpot.fish.slice(0, 4).map((fish) => (
                      <span key={fish} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {fish}
                      </span>
                    ))}
                    {selectedSpot.fish.length > 4 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">+{selectedSpot.fish.length - 4}</span>
                    )}
                  </div>

                  <Link
                    href={`/wiki?water=${selectedSpot.id}`}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Деталі водойми
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              {locationMessage && (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                  {locationMessage}
                </div>
              )}
            </div>

            <div className="absolute left-5 bottom-5 z-[600] rounded-full border border-white/70 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
              {copy.map.hint}
            </div>

            <div className="absolute right-5 top-5 z-[600] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => mapInstance?.zoomIn()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label={copy.map.zoomIn}
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => mapInstance?.zoomOut()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label={copy.map.zoomOut}
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleLocateUser}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                aria-label={copy.map.locationButton}
              >
                <LocateFixed className={isLocating ? "h-5 w-5 animate-pulse" : "h-5 w-5"} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}