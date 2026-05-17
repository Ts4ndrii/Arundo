/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowRight,
  ArrowLeft,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Fish,
  Filter,
  Heart,
  Ruler,
  Scale,
  Search,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useAppUI } from "@/components/AppShell";
import { getUiCopy } from "@/lib/ui-copy";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type CatalogType = "fish" | "water";

type FishFromAPI = {
  _id: string;
  name: string;
  scientificName: string;
  description: string;
  image?: { url: string; publicId: string };
  maxWeight?: number;
  maxLength?: number;
};

type WaterFromAPI = {
  _id: string;
  name: string;
  location: { type: string; coordinates: [number, number] };
  description: string;
  images: { url: string; publicId: string }[];
  fishSpecies: string[];
  waterType?: string;
  dominantFish?: string[];
  bestSeasons?: string[];
  createdAt: string;
};

type FishCard = {
  id: string;
  name: string;
  badge: string;
  summary: string;
  scientificName: string;
  size: string;
  maxWeight?: number;
  maxLength?: number;
  imageUrl?: string | null;
};

type WaterCard = {
  id: string;
  name: string;
  place: string;
  description: string;
  fish: string[];
  waterType?: string;
  dominantFish?: string[];
  bestSeasons?: string[];
  coordinates: [number, number];
  images?: { url: string; publicId: string }[];
  imageUrl?: string | null;
};

const seasonMap: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  spring: { label: "Весна", emoji: "🌱", color: "text-green-700", bg: "bg-green-50 dark:bg-green-950/30" },
  summer: { label: "Літо", emoji: "☀️", color: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-950/30" },
  autumn: { label: "Осінь", emoji: "🍂", color: "text-orange-700", bg: "bg-orange-50 dark:bg-orange-950/30" },
  winter: { label: "Зима", emoji: "❄️", color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-950/30" },
};

// ─── Компонент зображення з blur-фоном ───────────────────────────────────────
function BlurBehindImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallback?: React.ReactNode;
}) {
  const [error, setError] = useState(false);

  if (error) return <>{fallback}</>;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-60 saturate-150"
        onError={() => setError(true)}
      />
      <div className="absolute inset-0 bg-black/20" />
      <img
        src={src}
        alt={alt}
        className={`relative z-10 ${className}`}
        onError={() => setError(true)}
      />
    </div>
  );
}

function WaterCardThumbnail({ water }: { water: WaterCard }) {
  if (!water.imageUrl) {
    return (
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
        <div className="rounded-full border border-white/30 bg-white/15 p-6 backdrop-blur-sm">
          <Droplets className="h-12 w-12 text-white" />
        </div>
      </div>
    );
  }

  return (
    <BlurBehindImage
      src={water.imageUrl}
      alt={water.name}
      className="h-48 w-full object-cover"
      containerClassName="h-48 w-full"
      fallback={
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
          <div className="rounded-full border border-white/30 bg-white/15 p-6 backdrop-blur-sm">
            <Droplets className="h-12 w-12 text-white" />
          </div>
        </div>
      }
    />
  );
}

function FishCardThumbnail({ fish }: { fish: FishCard }) {
  if (!fish.imageUrl) {
    return (
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-amber-300 via-orange-400 to-blue-700">
        <div className="rounded-full border border-white/30 bg-white/15 p-6 backdrop-blur-sm">
          <Fish className="h-12 w-12 text-white" />
        </div>
      </div>
    );
  }

  return (
    <BlurBehindImage
      src={fish.imageUrl}
      alt={fish.name}
      className="h-48 w-full object-contain relative z-10"
      containerClassName="h-48 w-full"
      fallback={
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-amber-300 via-orange-400 to-blue-700">
          <div className="rounded-full border border-white/30 bg-white/15 p-6 backdrop-blur-sm">
            <Fish className="h-12 w-12 text-white" />
          </div>
        </div>
      }
    />
  );
}

function FilterSection({
  title,
  items,
  icon,
  selectedItems,
  onChange,
}: {
  title: string;
  items: string[];
  icon: typeof Droplets;
  selectedItems: string[];
  onChange: (items: string[]) => void;
}) {
  const Icon = icon;

  const toggle = (item: string) => {
    if (selectedItems.includes(item)) {
      onChange(selectedItems.filter(i => i !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  return (
    <details open className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-950">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900 dark:text-white">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-600" />
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180 dark:text-slate-300" />
      </summary>

      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => toggle(item)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-500"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

export function WikiExplorer({
  initialWaterId = null,
  initialFishId = null,
}: {
  initialWaterId?: string | null;
  initialFishId?: string | null;
}) {
  const { language, favoriteWaterIds, toggleFavorite } = useAppUI();
  const copy = getUiCopy(language);

  const [fishList, setFishList] = useState<FishFromAPI[]>([]);
  const [waterList, setWaterList] = useState<WaterFromAPI[]>([]);
  const [filterWaterTypes, setFilterWaterTypes] = useState<string[]>([]);
  const [filterFish, setFilterFish] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogType, setCatalogType] = useState<CatalogType>("fish");
  const [selectedItem, setSelectedItem] = useState<{ kind: CatalogType; item: FishCard | WaterCard } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialSelectedDone, setInitialSelectedDone] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedWaterTypes, setSelectedWaterTypes] = useState<string[]>([]);
  const [selectedFishTypes, setSelectedFishTypes] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fishRes, waterRes, filterWtRes, filterFishRes] = await Promise.all([
          fetch(`${API_URL}/api/fish`),
          fetch(`${API_URL}/api/water`),
          fetch(`${API_URL}/api/filters/water-types`),
          fetch(`${API_URL}/api/filters/fish`)
        ]);
        const fishData = await fishRes.json();
        const waterData = await waterRes.json();
        const waterTypesData = await filterWtRes.json();
        const filterFishData = await filterFishRes.json();

        setFishList(fishData);
        setWaterList(waterData);
        setFilterWaterTypes(waterTypesData.map((t: any) => t.name));
        setFilterFish(filterFishData.map((f: any) => f.name));
      } catch (error) {
        console.error('Помилка завантаження енциклопедії:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fishCards: FishCard[] = useMemo(() =>
    fishList.map((fish) => ({
      id: fish._id,
      name: fish.name,
      badge: fish.scientificName ? fish.scientificName.split(' ')[0] : 'Прісноводна',
      summary: fish.description || 'Опис відсутній',
      scientificName: fish.scientificName || '—',
      size: fish.maxLength ? `${fish.maxLength} см` : 'Невідомо',
      maxWeight: fish.maxWeight,
      maxLength: fish.maxLength,
      imageUrl: fish.image?.url || null,
    })),
    [fishList]
  );

  const waterCards: WaterCard[] = useMemo(() =>
    waterList.map((water) => ({
      id: water._id,
      name: water.name,
      place: `${water.location.coordinates[1]?.toFixed(4)}, ${water.location.coordinates[0]?.toFixed(4)}`,
      description: water.description || 'Опис відсутній',
      fish: water.fishSpecies || [],
      waterType: (water as any).waterType || '',
      dominantFish: (water as any).dominantFish || [],
      bestSeasons: (water as any).bestSeasons || [],
      coordinates: water.location.coordinates,
      images: water.images || [],
      imageUrl: water.images?.[0]?.url || null,
    })),
    [waterList]
  );

  const filteredWaterCards = useMemo(() =>
    waterCards.filter(water => {
      const matchesSearch = water.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        water.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWaterType = selectedWaterTypes.length === 0 ||
        (water.waterType && selectedWaterTypes.includes(water.waterType));
      const matchesFish = selectedFishTypes.length === 0 ||
        water.fish.some(f => selectedFishTypes.includes(f));
      const matchesSeason = selectedSeasons.length === 0 ||
        (water.bestSeasons && water.bestSeasons.some(s => selectedSeasons.includes(seasonMap[s]?.label || s)));

      return matchesSearch && matchesWaterType && matchesFish && matchesSeason;
    }),
    [waterCards, searchTerm, selectedWaterTypes, selectedFishTypes, selectedSeasons]
  );

  const filteredFishCards = useMemo(() =>
    fishCards.filter(fish =>
      fish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fish.summary.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [fishCards, searchTerm]
  );

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const waterId = urlParams.get('water');
      const fishId = urlParams.get('fish');
      if (!waterId && !fishId) {
        setSelectedItem(null);
        setCatalogType("fish");
        setCurrentImageIndex(0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Відкриваємо водойму за initialWaterId
  useEffect(() => {
    if (!initialSelectedDone && initialWaterId && waterCards.length > 0 && !selectedItem) {
      const water = waterCards.find(w => w.id === initialWaterId);
      if (water) {
        setCatalogType("water");
        setSelectedItem({ kind: "water", item: water });
        setInitialSelectedDone(true);
        setCurrentImageIndex(0);
      }
    }
  }, [initialWaterId, waterCards, selectedItem, initialSelectedDone]);

  // Відкриваємо рибу за initialFishId
  useEffect(() => {
    if (!initialSelectedDone && initialFishId && fishCards.length > 0 && !selectedItem) {
      const fish = fishCards.find(f => f.id === initialFishId);
      if (fish) {
        setCatalogType("fish");
        setSelectedItem({ kind: "fish", item: fish });
        setInitialSelectedDone(true);
      }
    }
  }, [initialFishId, fishCards, selectedItem, initialSelectedDone]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedItem]);

  const handleBackToList = () => {
    setSelectedItem(null);
    setCatalogType("fish");
    window.history.pushState({}, '', '/wiki');
    setInitialSelectedDone(false);
    setCurrentImageIndex(0);
  };

  const handleBackToWaterList = () => {
    setSelectedItem(null);
    setCatalogType("water");
    window.history.pushState({}, '', '/wiki');
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedItem?.kind === "water") {
      const images = (selectedItem.item as WaterCard).images;
      if (images && images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
    }
  };

  const prevImage = () => {
    if (selectedItem?.kind === "water") {
      const images = (selectedItem.item as WaterCard).images;
      if (images && images.length > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  const seasonOptions = ["spring", "summer", "autumn", "winter"];
  const seasonLabels: Record<string, string> = {
    spring: "Весна",
    summer: "Літо",
    autumn: "Осінь",
    winter: "Зима"
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-slate-600">Завантаження енциклопедії...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 transition-colors duration-200 sm:px-6 lg:px-8 lg:py-8 dark:bg-slate-950">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">{copy.wiki.label}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">{copy.wiki.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">{copy.wiki.description}</p>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                <Filter className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{copy.wiki.filterTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.wiki.filterDescription}</p>
              </div>
            </div>

            <label className="relative mt-5 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder={copy.wiki.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
              />
            </label>

            <div className="mt-5 space-y-3">
              <FilterSection
                title={copy.wiki.filterSections.waterType}
                items={filterWaterTypes.length ? filterWaterTypes : copy.wiki.waterTypes}
                icon={Droplets}
                selectedItems={selectedWaterTypes}
                onChange={setSelectedWaterTypes}
              />
              <FilterSection
                title={copy.wiki.filterSections.targetFish}
                items={filterFish.length ? filterFish : copy.wiki.targetFish}
                icon={Target}
                selectedItems={selectedFishTypes}
                onChange={setSelectedFishTypes}
              />
              <FilterSection
                title={copy.wiki.filterSections.season}
                items={seasonOptions.map(s => seasonLabels[s])}
                icon={CalendarRange}
                selectedItems={selectedSeasons}
                onChange={setSelectedSeasons}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">{copy.wiki.catalogLabel}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {selectedItem
                    ? (selectedItem.kind === "fish" ? "Детальна картка риби" : "Детальна картка водойми")
                    : (catalogType === "fish" ? copy.wiki.listTitle : copy.wiki.waterGridTitle)}
                </h2>
              </div>
              {!selectedItem && (
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                    <button
                      type="button"
                      aria-pressed={catalogType === "fish"}
                      onClick={() => setCatalogType("fish")}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        catalogType === "fish" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      ].join(" ")}
                    >
                      {copy.wiki.fishGridTab}
                    </button>
                    <button
                      type="button"
                      aria-pressed={catalogType === "water"}
                      onClick={() => setCatalogType("water")}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        catalogType === "water" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      ].join(" ")}
                    >
                      {copy.wiki.waterGridTab}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedItem ? (
            selectedItem.kind === "water" ? (
              // Детальна водойма
              <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {(selectedItem.item as WaterCard).images && (selectedItem.item as WaterCard).images!.length > 0 ? (
                  <div className="relative h-72 w-full sm:h-96">
                    <img
                      src={(selectedItem.item as WaterCard).images![currentImageIndex]?.url}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-70 saturate-150"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <img
                      src={(selectedItem.item as WaterCard).images![currentImageIndex]?.url}
                      alt={selectedItem.item.name}
                      className="relative z-10 h-full w-full object-contain"
                    />
                    {(selectedItem.item as WaterCard).images!.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                          {(selectedItem.item as WaterCard).images!.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`h-2 w-2 rounded-full transition ${i === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"}`}
                            />
                          ))}
                        </div>
                        <div className="absolute bottom-3 right-4 z-20 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                          {currentImageIndex + 1} / {(selectedItem.item as WaterCard).images!.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
                    <div className="rounded-full border border-white/30 bg-white/15 p-10 backdrop-blur-sm">
                      <Droplets className="h-20 w-20 text-white" />
                    </div>
                  </div>
                )}

                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">{selectedItem.item.name}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{(selectedItem.item as WaterCard).place}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selectedItem.item.id)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500 dark:hover:border-red-400/40 dark:hover:text-red-400"
                    >
                      <Heart className={`h-5 w-5 ${favoriteWaterIds.includes(selectedItem.item.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{(selectedItem.item as WaterCard).description}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {(selectedItem.item as WaterCard).waterType && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Тип водойми</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{(selectedItem.item as WaterCard).waterType}</p>
                      </div>
                    )}

                    {(selectedItem.item as WaterCard).bestSeasons && (selectedItem.item as WaterCard).bestSeasons!.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Найкращі сезони</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(selectedItem.item as WaterCard).bestSeasons!.map((season) => {
                            const s = seasonMap[season];
                            return s ? (
                              <span key={season} className={`inline-flex items-center gap-1 rounded-full ${s.bg} px-2 py-0.5 text-xs font-medium ${s.color}`}>
                                <span>{s.emoji}</span> {s.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Риби у водоймі</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedItem.item as WaterCard).fish.length > 0 ? (
                          (selectedItem.item as WaterCard).fish.slice(0, 5).map((fish) => (
                            <span key={fish} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{fish}</span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">Немає даних</span>
                        )}
                        {(selectedItem.item as WaterCard).fish.length > 5 && (
                          <span className="text-xs text-slate-500">+{(selectedItem.item as WaterCard).fish.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleBackToWaterList}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <ArrowLeft className="h-4 w-4" /> Назад до списку водойм
                    </button>
                    <Link href="/map" className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
                      На карту
                    </Link>
                  </div>
                </div>
              </article>
            ) : (
              // Детальна риба
              <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {(selectedItem.item as FishCard).imageUrl ? (
                  <div className="relative h-64 w-full sm:h-80">
                    <img
                      src={(selectedItem.item as FishCard).imageUrl!}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60 saturate-150"
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    <img
                      src={(selectedItem.item as FishCard).imageUrl!}
                      alt={selectedItem.item.name}
                      className="relative z-10 h-full w-full object-contain p-4"
                    />
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-10">
                      <h2 className="text-3xl font-black leading-tight text-white drop-shadow-lg">{selectedItem.item.name}</h2>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-amber-300 via-orange-400 to-blue-700 sm:h-80">
                    <div className="rounded-full border border-white/30 bg-white/15 p-10 backdrop-blur-sm">
                      <Fish className="h-20 w-20 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-6 pb-5 pt-10">
                      <h2 className="text-3xl font-black leading-tight text-white drop-shadow-lg">{selectedItem.item.name}</h2>
                    </div>
                  </div>
                )}

                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">
                      {(selectedItem.item as FishCard).scientificName || "—"}
                    </p>
                    <div className="inline-flex rounded-full bg-blue-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      {(selectedItem.item as FishCard).badge}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                        <Ruler className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{copy.wiki.lengthLabel}</span>
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">{(selectedItem.item as FishCard).size || "--"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                        <Scale className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{copy.wiki.weightLabel}</span>
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
                        {(selectedItem.item as FishCard).maxWeight ? `до ${(selectedItem.item as FishCard).maxWeight} кг` : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Опис</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{(selectedItem.item as FishCard).summary}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <ArrowLeft className="h-4 w-4" /> До списку риб
                    </button>
                    <Link href="/map" className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
                      На карту
                    </Link>
                  </div>
                </div>
              </article>
            )
          ) : (
            // ─── Сітка карток ─────────────────────────────────────────────────
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {catalogType === "water" ? (
                filteredWaterCards.map((water) => (
                  <article key={water.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative overflow-hidden">
                      <WaterCardThumbnail water={water} />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(water.id)}
                        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur-sm transition hover:text-red-500 dark:bg-slate-900/80 dark:text-slate-500"
                      >
                        <Heart className={`h-4 w-4 ${favoriteWaterIds.includes(water.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-6">
                        {water.waterType && (
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                            {water.waterType}
                          </span>
                        )}
                        {water.bestSeasons && water.bestSeasons.length > 0 && (
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                            🗓️ {water.bestSeasons.map(s => seasonMap[s]?.label || s).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg font-black leading-tight text-slate-900 dark:text-slate-100">{water.name}</h3>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{water.place}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-2">{water.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {water.fish.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{f}</span>
                        ))}
                        {water.fish.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">+{water.fish.length - 3}</span>
                        )}
                      </div>
                      <div className="mt-auto pt-4">
                        <button type="button" onClick={() => setSelectedItem({ kind: "water", item: water })} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                          <ArrowRight className="h-4 w-4" />{copy.wiki.detailsCTA}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                filteredFishCards.map((fish) => (
                  <article key={fish.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative overflow-hidden">
                      <FishCardThumbnail fish={fish} />
                      <div className="absolute left-3 top-3 z-10 inline-flex rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {fish.badge}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg font-black leading-tight text-slate-900 dark:text-slate-100">{fish.name}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-2">{fish.summary}</p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{copy.wiki.lengthLabel}</p>
                          <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">{fish.size}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{copy.wiki.weightLabel}</p>
                          <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                            {fish.maxWeight ? `до ${fish.maxWeight} кг` : "--"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <button type="button" onClick={() => setSelectedItem({ kind: "fish", item: fish })} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                          <ArrowRight className="h-4 w-4" />{copy.wiki.detailsCTA}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}