"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Fish, Plus, X, CalendarDays, Scale, MapPin, Camera,
  ChevronDown, ChevronUp, Trash2, Edit3, Loader2,
  BarChart3, Trophy, Waves, UserPlus, LogIn,
} from "lucide-react";
import { useAppUI } from "@/components/AppShell";

// ─── Types ────────────────────────────────────────────────────
type Waterbody = {
  _id: string;
  name: string;
  location: { coordinates: [number, number] };
  waterType?: string;
};

type CatchPhoto = { url: string; publicId: string };

type CatchRecord = {
  _id: string;
  userId: string;
  userName: string;
  waterbodyId: string;
  waterbodyName: string;
  waterbodyCoords: { lat: number; lng: number } | null;
  date: string;
  species: string;
  fishCount: number;
  biggestFishName: string;
  biggestFishWeight: number;
  notes: string;
  photos: CatchPhoto[];
  createdAt: string;
};

type FormDraft = {
  waterbodyId: string;
  waterbodyName: string;
  date: string;
  species: string;
  fishCount: string;
  biggestFishName: string;
  biggestFishWeight: string;
  notes: string;
  photos: File[];
};

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arundo_token");
}

function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}.${m}.${y}`;
}

// ─── Auth Gate ────────────────────────────────────────────────
function AuthGate() {
  const { openAuth } = useAppUI();

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400" />

      <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/10 dark:bg-blue-500/10">
            <Fish className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 shadow-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
          Ведіть щоденник уловів
        </h2>
        <p className="mt-3 max-w-sm text-base leading-7 text-slate-600 dark:text-slate-300">
          Зареєструйтесь або увійдіть, щоб записувати улови, додавати фото та переглядати особисту статистику.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3 text-sm">
          {[
            { icon: "📍", text: "Прив'язка до водойми" },
            { icon: "📷", text: "Фото трофеїв" },
            { icon: "📊", text: "Особиста статистика" },
          ].map((f) => (
            <div
              key={f.text}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/60"
            >
              <span className="text-base">{f.icon}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Зареєструватись
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
          >
            <LogIn className="h-4 w-4" />
            Увійти
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Interactive Map ─────────────────────────────────────
function MiniMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: true,
        attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(name).openPopup();
      mapInstanceRef.current = map;
    };

    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name]);

  return (
    <div
      ref={mapRef}
      className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
    />
  );
}

// ─── Photo Grid ───────────────────────────────────────────────
function PhotoGrid({
  photos,
  onRemove,
}: {
  photos: CatchPhoto[];
  onRemove?: (publicId: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div
        className={`grid gap-2 ${
          photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"
        }`}
      >
        {photos.map((photo) => (
          <div
            key={photo.publicId}
            className="relative group cursor-pointer overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800"
            style={{ aspectRatio: "4/3" }}
            onClick={() => setLightbox(photo.url)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-60"
              style={{ backgroundImage: `url(${photo.url})` }}
            />
            <img src={photo.url} alt="Фото улову" className="relative z-10 w-full h-full object-contain" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(photo.publicId); }}
                className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[90vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-30"
              style={{ backgroundImage: `url(${lightbox})` }}
            />
            <img src={lightbox} alt="" className="relative z-10 max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Waterbody Selector ───────────────────────────────────────
function WaterbodySelector({
  value,
  displayName,
  onChange,
}: {
  value: string;
  displayName: string;
  onChange: (id: string, name: string) => void;
}) {
  const [query, setQuery] = useState(displayName);
  const [open, setOpen] = useState(false);
  const [bodies, setBodies] = useState<Waterbody[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setQuery(displayName); }, [displayName]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE}/api/water`)
      .then((r) => r.json())
      .then((data: Waterbody[]) => setBodies(Array.isArray(data) ? data : []))
      .catch(() => setBodies([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = bodies.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative">
      <div className="relative">
        <Waves className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          readOnly={!!value}
          onClick={() => { if (!value) setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (!value) setOpen(true); }}
          placeholder="Оберіть водойму зі списку…"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {value ? (
          <button
            type="button"
            onClick={() => { onChange("", ""); setQuery(""); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-red-500 transition"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        )}
      </div>

      {open && !value && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">Водойм не знайдено</p>
          ) : (
            filtered.map((b) => (
              <button
                key={b._id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(b._id, b.name); setQuery(b.name); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.name}</span>
                {b.waterType && <span className="ml-auto text-xs text-slate-400">{b.waterType}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Dialog ────────────────────────────────────────
function CatchDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: CatchRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [draft, setDraft] = useState<FormDraft>(emptyDraft);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function emptyDraft(): FormDraft {
    return {
      waterbodyId: "", waterbodyName: "", date: todayISO(),
      species: "", fishCount: "1", biggestFishName: "",
      biggestFishWeight: "", notes: "", photos: [],
    };
  }

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDraft({
        waterbodyId: initial.waterbodyId, waterbodyName: initial.waterbodyName,
        date: initial.date, species: initial.species,
        fishCount: String(initial.fishCount), biggestFishName: initial.biggestFishName,
        biggestFishWeight: initial.biggestFishWeight ? String(initial.biggestFishWeight) : "",
        notes: initial.notes, photos: [],
      });
    } else {
      setDraft(emptyDraft());
    }
    setPhotoFiles([]); setPhotoPreviews([]); setRemoveIds([]); setError("");
  }, [open, initial]);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.waterbodyId) { setError("Оберіть водойму зі списку"); return; }
    if (!draft.date) { setError("Вкажіть дату"); return; }
    if (!draft.species.trim()) { setError("Вкажіть вид риби"); return; }
    if (parseInt(draft.fishCount) < 1) { setError("Кількість риб має бути ≥ 1"); return; }

    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("waterbodyId", draft.waterbodyId);
      fd.append("date", draft.date);
      fd.append("species", draft.species.trim());
      fd.append("fishCount", draft.fishCount);
      fd.append("biggestFishName", draft.biggestFishName.trim());
      fd.append("biggestFishWeight", draft.biggestFishWeight || "0");
      fd.append("notes", draft.notes.trim());
      if (removeIds.length > 0) fd.append("removePhotos", JSON.stringify(removeIds));
      photoFiles.forEach((f) => fd.append("photos", f));

      const url = isEdit ? `${API_BASE}/api/catches/${initial!._id}` : `${API_BASE}/api/catches`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Помилка збереження");
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const existingPhotos = (initial?.photos ?? []).filter((p) => !removeIds.includes(p.publicId));

  return (
    // Виправлено: вужчий діалог, зменшено верхній відступ, додано max-width
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/60 px-4 pt-12 pb-4 backdrop-blur-sm sm:items-center sm:pt-4">
      <button type="button" aria-label="Закрити" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-slate-900 flex flex-col"
        style={{ maxHeight: "calc(100vh - 3rem)" }}
      >
        {/* Header — компактний, з нормальним відступом */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/70 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
              {isEdit ? "Редагувати запис" : "Новий запис"}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900 dark:text-slate-100">
              {isEdit ? "Зміна улову" : "Додати улов"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-3 sm:px-6 space-y-3">
          {/* Водойма */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Водойма *</label>
            <WaterbodySelector
              value={draft.waterbodyId}
              displayName={draft.waterbodyName}
              onChange={(id, name) => setDraft((d) => ({ ...d, waterbodyId: id, waterbodyName: name }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Дата *</label>
              <input
                type="date" value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Вид риби *</label>
              <input
                type="text" value={draft.species}
                onChange={(e) => setDraft((d) => ({ ...d, species: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) }))}
                placeholder="Короп, Щука, Карась…"
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Кількість риб *</label>
              <input
                type="number" min="1" step="1" value={draft.fishCount}
                onChange={(e) => setDraft((d) => ({ ...d, fishCount: e.target.value }))}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Трофей — назва</label>
              <input
                type="text" value={draft.biggestFishName}
                onChange={(e) => setDraft((d) => ({ ...d, biggestFishName: e.target.value }))}
                placeholder="Необов'язково"
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Трофей — вага (кг)</label>
              <input
                type="number" min="0.1" step="0.01" value={draft.biggestFishWeight}
                onChange={(e) => setDraft((d) => ({ ...d, biggestFishWeight: e.target.value }))}
                placeholder="5.3"
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Нотатки</label>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="Що клювало, на що, погода, настрій…"
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 resize-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Фото */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Фото улову</label>
            {existingPhotos.length > 0 && (
              <div className="mb-2">
                <PhotoGrid photos={existingPhotos} onRemove={(id) => setRemoveIds((p) => [...p, id])} />
              </div>
            )}
            {photoPreviews.length > 0 && (
              <div className={`mb-2 grid gap-2 ${photoPreviews.length === 1 ? "grid-cols-1" : photoPreviews.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative group overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800" style={{ aspectRatio: "4/3" }}>
                    <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-60" style={{ backgroundImage: `url(${src})` }} />
                    <img src={src} alt="" className="relative z-10 w-full h-full object-contain" />
                    <button type="button" onClick={() => {
                      setPhotoFiles((p) => p.filter((_, j) => j !== i));
                      setPhotoPreviews((p) => p.filter((_, j) => j !== i));
                    }} className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
            >
              <Camera className="h-3.5 w-3.5" /> Додати фото
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilePick} />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              Скасувати
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Зберігаємо…" : isEdit ? "Зберегти зміни" : "Додати запис"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Catch Card ───────────────────────────────────────────────
function CatchCard({ record, onEdit, onDelete }: { record: CatchRecord; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white overflow-hidden shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {record.photos.length > 0 ? (
        <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-60" style={{ backgroundImage: `url(${record.photos[0].url})` }} />
          <img src={record.photos[0].url} alt="Улов" className="relative z-10 w-full h-full object-contain" />
          {record.photos.length > 1 && (
            <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              +{record.photos.length - 1} фото
            </div>
          )}
        </div>
      ) : (
        <div className="h-24 bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_50%,#d1fae5_100%)] flex items-center justify-center">
          <Fish className="h-10 w-10 text-blue-300" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{record.species}</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{record.waterbodyName}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-black text-blue-600">{record.fishCount} шт</p>
            <p className="text-xs text-slate-400">{formatDate(record.date)}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {record.biggestFishName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Trophy className="h-3 w-3" />
              {record.biggestFishName}
              {record.biggestFishWeight > 0 && ` · ${record.biggestFishWeight} кг`}
            </span>
          )}
          {record.notes && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 line-clamp-1 max-w-[200px]">
              {record.notes}
            </span>
          )}
        </div>

        <button
          type="button" onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition dark:text-blue-400"
        >
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Згорнути</> : <><ChevronDown className="h-3.5 w-3.5" /> Детальніше</>}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            {record.waterbodyCoords && (
              <MiniMap lat={record.waterbodyCoords.lat} lng={record.waterbodyCoords.lng} name={record.waterbodyName} />
            )}
            {record.photos.length > 1 && <PhotoGrid photos={record.photos} />}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950/60">
                <CalendarDays className="mx-auto h-4 w-4 text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">{formatDate(record.date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950/60">
                <Fish className="mx-auto h-4 w-4 text-blue-400 mb-1" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{record.fishCount} шт</p>
              </div>
              {record.biggestFishWeight > 0 && (
                <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950/60">
                  <Scale className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{record.biggestFishWeight} кг</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onEdit}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <Edit3 className="h-3.5 w-3.5" /> Редагувати
              </button>
              <button type="button" onClick={onDelete}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-red-800"
              >
                <Trash2 className="h-3.5 w-3.5" /> Видалити
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
function ConfirmDialog({ open, title, description, onClose, onConfirm }: {
  open: boolean; title: string; description: string; onClose: () => void; onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-md">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-600 dark:text-red-300">Підтвердження</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              Скасувати
            </button>
            <button type="button" onClick={() => { onConfirm(); onClose(); }}
              className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function StatsDashboard() {
  const { user } = useAppUI();
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CatchRecord | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "stats">("list");

  const fetchCatches = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/catches/my`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setCatches(Array.isArray(data) ? data : []);
    } catch {
      setCatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatches(); }, [fetchCatches]);

  async function handleDelete(id: string) {
    try {
      await fetch(`${API_BASE}/api/catches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchCatches();
    } catch {}
  }

  const totalFish = catches.reduce((s, c) => s + c.fishCount, 0);
  const biggestCatch = catches
    .filter((c) => c.biggestFishWeight > 0 && c.biggestFishName)
    .sort((a, b) => b.biggestFishWeight - a.biggestFishWeight)[0];
  const speciesMap = new Map<string, number>();
  catches.forEach((c) => speciesMap.set(c.species, (speciesMap.get(c.species) ?? 0) + c.fishCount));
  const topSpecies = Array.from(speciesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <>
      <CatchDialog
        open={dialogOpen}
        initial={editTarget}
        onClose={() => { setDialogOpen(false); setEditTarget(undefined); }}
        onSaved={fetchCatches}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Видалити запис?"
        description="Це незворотня дія. Запис та всі фото будуть видалені назавжди."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 transition-colors duration-200 dark:bg-slate-950 min-h-screen">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
            Мій щоденник
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Записи улову
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Ведіть особистий журнал рибальських виходів — дата, водойма, вид, кількість та фото трофеїв.
          </p>
        </section>

        {!user ? (
          <div className="mt-8">
            <AuthGate />
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 w-fit dark:border-slate-800 dark:bg-slate-900">
                {(["list", "stats"] as const).map((t) => (
                  <button
                    key={t} type="button" onClick={() => setTab(t)}
                    className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${
                      tab === t
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {t === "list" ? (
                      <span className="flex items-center gap-2"><Fish className="h-4 w-4" /> Записи</span>
                    ) : (
                      <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Статистика</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { setEditTarget(undefined); setDialogOpen(true); }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Додати улов
              </button>
            </div>

            {tab === "list" && (
              <div className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : catches.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <Fish className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-slate-100">
                      Ще немає жодного запису
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                      Зловіть першу рибу й занесіть результат до щоденника!
                    </p>
                    <button
                      type="button" onClick={() => setDialogOpen(true)}
                      className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" /> Додати перший улов
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catches.map((record) => (
                      <CatchCard
                        key={record._id} record={record}
                        onEdit={() => { setEditTarget(record); setDialogOpen(true); }}
                        onDelete={() => setDeleteTarget(record._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "stats" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <BarChart3 className="mx-auto h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Виходів</p>
                    <p className="mt-1 text-4xl font-black text-slate-900 dark:text-slate-100">{catches.length}</p>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <Fish className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Риб зловлено</p>
                    <p className="mt-1 text-4xl font-black text-slate-900 dark:text-slate-100">{totalFish}</p>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <Trophy className="mx-auto h-6 w-6 text-amber-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Найбільший трофей</p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                      {biggestCatch ? `${biggestCatch.biggestFishWeight} кг` : "—"}
                    </p>
                    {biggestCatch && <p className="mt-0.5 text-xs text-slate-400">{biggestCatch.biggestFishName}</p>}
                  </div>
                </div>

                {biggestCatch && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">🏆 Найбільший улов</h3>
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{biggestCatch.biggestFishName}</p>
                        <p className="mt-1 text-sm text-slate-500">{biggestCatch.species} · {biggestCatch.waterbodyName}</p>
                        <div className="mt-3 flex gap-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Scale className="h-4 w-4 text-amber-500" /> {biggestCatch.biggestFishWeight} кг
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-slate-400" /> {formatDate(biggestCatch.date)}
                          </div>
                        </div>
                      </div>
                      {biggestCatch.photos.length > 0 && (
                        <div className="shrink-0 w-28 h-28 rounded-2xl overflow-hidden relative bg-slate-100">
                          <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-60" style={{ backgroundImage: `url(${biggestCatch.photos[0].url})` }} />
                          <img src={biggestCatch.photos[0].url} alt="" className="relative z-10 w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                    {biggestCatch.waterbodyCoords && (
                      <div className="mt-4">
                        <MiniMap lat={biggestCatch.waterbodyCoords.lat} lng={biggestCatch.waterbodyCoords.lng} name={biggestCatch.waterbodyName} />
                      </div>
                    )}
                  </div>
                )}

                {topSpecies.length > 0 && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">За видами</h3>
                    <div className="space-y-3">
                      {topSpecies.map(([name, count], i) => {
                        const pct = Math.round((count / totalFish) * 100);
                        const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-sky-500"];
                        return (
                          <div key={name}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                              <span className="text-sm text-slate-500">{count} шт · {pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {catches.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-slate-500">Додайте перший запис, щоб бачити статистику</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}