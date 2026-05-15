/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Headphones,
  Settings2,
  Heart,
  X,
  User,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAppUI } from "@/components/AppShell";
import { getUiCopy } from "@/lib/ui-copy";
import type { HeaderUser } from "@/components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Виправлення latin1→utf8 на клієнті ──────────────────────────────────────
function fixEncoding(str: string | null | undefined): string {
  if (!str) return "";
  try {
    if (/[\xC0-\xFF]/.test(str)) {
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    }
  } catch (_) {}
  return str;
}

// ─── Типи ────────────────────────────────────────────────────────────────────
type WaterFromAPI = {
  _id: string;
  name: string;
  location: { type: string; coordinates: [number, number] };
  description: string;
  images: { url: string; publicId: string }[];
  fishSpecies: string[];
  waterType?: string;
  createdAt: string;
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-3 duration-300">
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl text-sm font-medium ${
          type === "error"
            ? "bg-red-500 text-white"
            : "bg-emerald-500 text-white"
        }`}
      >
        {type === "error" ? (
          <AlertCircle className="h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 shrink-0" />
        )}
        {message}
      </div>
    </div>
  );
}

// ─── Модалка редагування профілю ─────────────────────────────────────────────
function EditProfileModal({
  open,
  user,
  onClose,
  onSave,
  onUploadAvatar,
  isSaving,
}: {
  open: boolean;
  user: HeaderUser | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string | null>;
  isSaving: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && user) {
      const fixedName = fixEncoding(user.name);
      const parts = fixedName.split(/\s+/).filter(Boolean);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [open, user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Фото не більше 2MB");
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    const newUrl = await onUploadAvatar(file);
    setUploading(false);
    if (newUrl) setAvatarPreview(newUrl);
  };

  const handleSubmit = async () => {
    const name = `${firstName.trim()} ${lastName.trim()}`.trim() || user?.name || "Гість";
    await onSave(name);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Редагувати профіль
        </h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              {uploading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="Аватар" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Максимум 2MB (JPG, PNG, WEBP)</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ім&apos;я
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ваше ім'я"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Прізвище
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ваше прізвище"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || uploading}
          className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Збереження...
            </>
          ) : (
            "Зберегти зміни"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Основний компонент ───────────────────────────────────────────────────────
export default function ProfilePageContent() {
  const { user, openSettings, openSupport, language, favoriteWaterIds, toggleFavorite, updateUser } =
    useAppUI();
  const copy = getUiCopy(language);

  const [waterList, setWaterList] = useState<WaterFromAPI[]>([]);
  const [loadingWater, setLoadingWater] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  // Відстежуємо pending DB запити щоб уникнути race conditions
  const pendingRef = useRef<Set<string>>(new Set());

  const displayName = fixEncoding(user?.name) || copy.profile.guestName;
  const displayEmail = user?.email || copy.profile.guestEmail;
  const displayAvatar = user?.avatarUrl || null;
  const displayRole = user?.role || "user";

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken") || localStorage.getItem("userToken")
      : null;

  // ── Завантажити улюблені з БД один раз при монтуванні ───────────────────
  // Оновлюємо AppShell — після цього favoriteWaterIds є єдиним джерелом правди
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.favorites && Array.isArray(data.favorites) && user) {
            // Оновлюємо AppShell — це автоматично оновить favoriteWaterIds скрізь
            updateUser({ ...user, favoriteWaters: data.favorites });
          }
        }
      } catch (_) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Завантажити водойми з API ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/water`);
        const data = await res.json();
        setWaterList(Array.isArray(data) ? data : []);
      } catch {
        setWaterList([]);
      } finally {
        setLoadingWater(false);
      }
    })();
  }, []);

  // ── Toggle улюбленого: викликає toggleFavorite з AppShell (як у вікі) + синхронізує БД ──
  const handleToggleFavorite = useCallback(
    async (waterId: string) => {
      // Запобігаємо подвійному кліку
      if (pendingRef.current.has(waterId)) return;
      pendingRef.current.add(waterId);

      const isCurrentlyFavorite = favoriteWaterIds.includes(waterId);

      // 1. Оновлюємо AppShell оптимістично (toggleFavorite сам перемикає стан)
      toggleFavorite(waterId);

      // 2. Синхронізуємо з БД
      const token = getToken();
      if (!token) {
        pendingRef.current.delete(waterId);
        return;
      }

      try {
        if (isCurrentlyFavorite) {
          const res = await fetch(`${API_URL}/api/users/favorites/${waterId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("DELETE failed");
        } else {
          const res = await fetch(`${API_URL}/api/users/favorites/${waterId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("POST failed");
        }
      } catch (_) {
        // Відкат: повертаємо попередній стан через toggleFavorite
        toggleFavorite(waterId);
        showToast("Помилка збереження улюбленого", "error");
      } finally {
        pendingRef.current.delete(waterId);
      }
    },
    [favoriteWaterIds, toggleFavorite]
  );

  // ── Завантаження аватара ──────────────────────────────────────────────────
  const handleUploadAvatar = async (file: File): Promise<string | null> => {
    const token = getToken();
    if (!token) {
      showToast("Необхідно увійти", "error");
      return null;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch(`${API_URL}/api/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        if (user) updateUser({ ...user, avatarUrl: data.avatarUrl });
        showToast("Аватар оновлено!");
        return data.avatarUrl;
      }
      showToast(data.error || "Помилка завантаження", "error");
      return null;
    } catch {
      showToast("Помилка підключення", "error");
      return null;
    }
  };

  // ── Збереження профілю (ім'я) ─────────────────────────────────────────────
  const handleProfileSave = async (name: string) => {
    const token = getToken();
    if (!token) {
      showToast("Необхідно увійти", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        const fixedName = fixEncoding(data.user?.name || name);
        if (user) updateUser({ ...user, name: fixedName });
        showToast("Профіль оновлено!");
      } else {
        showToast(data.error || "Помилка оновлення", "error");
      }
    } catch {
      showToast("Помилка підключення", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Підготовка даних ──────────────────────────────────────────────────────
  const waterCards = waterList.map((w) => ({
    id: w._id,
    name: w.name,
    coords: `${w.location.coordinates[1]?.toFixed(4)}, ${w.location.coordinates[0]?.toFixed(4)}`,
    description: w.description || "Опис відсутній",
    fish: w.fishSpecies || [],
    imageUrl: w.images?.[0]?.url || null,
    waterType: w.waterType || "",
  }));

  // Використовуємо favoriteWaterIds з AppShell — єдине джерело правди
  const favoriteWaters = waterCards.filter((w) => favoriteWaterIds.includes(w.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 dark:bg-slate-950">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Заголовок */}
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
          {copy.profile.label}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          {copy.profile.label}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          {copy.profile.intro}
        </p>
      </section>

      {/* Картка профілю */}
      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:text-left">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 ring-4 ring-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-800">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-slate-400" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {displayName}
            </h2>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{displayEmail}</p>

            {displayRole === "admin" && (
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                Адміністратор
              </span>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {copy.profile.editProfile}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              type="button"
              onClick={openSupport}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              <Headphones className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Улюблені місця */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-5">
          Улюблені місця ({favoriteWaters.length})
        </h2>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {favoriteWaters.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {favoriteWaters.map((water) => (
                <div key={water.id} className="p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
                        {copy.profile.favoriteBadge}
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                        {water.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {water.coords}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(water.id)}
                      title="Видалити з улюблених"
                      className="shrink-0 text-red-500 transition hover:scale-110"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {water.imageUrl && (
                    <div className="mt-4 h-48 overflow-hidden rounded-xl">
                      <img
                        src={water.imageUrl}
                        alt={water.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 line-clamp-3">
                    {water.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {water.fish.slice(0, 6).map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/wiki?water=${water.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {copy.profile.viewDetails}
                    </Link>
                    <Link
                      href="/map"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Показати на карті
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500">
                <Heart className="h-7 w-7" />
              </div>
              <p className="max-w-xs text-base leading-7 text-slate-600 dark:text-slate-300">
                У вас ще немає улюблених місць. Додайте їх нижче!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Вибір улюблених водойм */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-700 dark:text-slate-200">
          Виберіть улюблені місця
        </h2>
        <div className="grid gap-3">
          {loadingWater ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Завантаження...
            </div>
          ) : waterCards.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Водойм не знайдено</p>
          ) : (
            waterCards.map((water) => {
              const isFav = favoriteWaterIds.includes(water.id);
              return (
                <button
                  key={water.id}
                  type="button"
                  onClick={() => handleToggleFavorite(water.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    isFav
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {water.name}
                    </div>
                    <div className="text-sm text-slate-500">{water.coords}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {water.fish.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs text-slate-400">
                          #{f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Heart
                    className={`h-5 w-5 shrink-0 transition ${
                      isFav ? "fill-red-500 text-red-500" : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Модалка */}
      <EditProfileModal
        open={isEditModalOpen}
        user={user ? { ...user, name: displayName } : null}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
        onUploadAvatar={handleUploadAvatar}
        isSaving={isSaving}
      />
    </main>
  );
}