"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, Fish, MapPinned, Plus, Scale } from "lucide-react";
import { useAppUI, type CatchInput, type CatchRecord } from "@/components/AppShell";
import fishCardsData from "@/data/wiki/fish-cards.json";
import waterCardsData from "@/data/wiki/water-cards.json";
import { getUiCopy, type LanguageCode } from "@/lib/ui-copy";
import DatePicker from "@/components/DatePicker";

type StatsFormDraft = {
  date: string;
  place: string;
  species: string;
  fishCount: string;
  biggestFishName: string;
  biggestFishWeight: string;
};

type NamedCard = {
  name: string;
};

 

const speciesAccentClasses = [
  "text-amber-600",
  "text-blue-600",
  "text-emerald-600",
  "text-sky-600",
  "text-rose-600",
  "text-violet-600",
];

function todayForInput() {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offsetMinutes * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function formatDateLabel(dateString: string) {
  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}.${month}.${year}`;
}

function formatFishCount(language: LanguageCode, fishCount: number) {
  const ui = getUiCopy(language).stats;
  return `${fishCount} ${ui.fishLabel}`;
}

function capitalizeFirstLetter(value: string) {
  const trimmedValue = value.replace(/^\s+/, "");

  if (!trimmedValue) {
    return "";
  }

  return `${trimmedValue.charAt(0).toUpperCase()}${trimmedValue.slice(1)}`;
}

function buildLocalizedNameResolver(cardsByLanguage: Record<string, NamedCard[]>, language: LanguageCode) {
  const currentCards = cardsByLanguage[language] ?? cardsByLanguage.en ?? [];
  const lookup = new Map<string, string>();

  for (const sourceCards of Object.values(cardsByLanguage)) {
    sourceCards.forEach((card, index) => {
      const localizedName = currentCards[index]?.name;

      if (!localizedName) {
        return;
      }

      lookup.set(card.name.trim().toLowerCase(), localizedName);
    });
  }

  return (value: string) => lookup.get(value.trim().toLowerCase()) ?? value;
}

type TripGroup = {
  id: string;
  place: string;
  latestDate: string;
  totalFishCount: number;
  entries: CatchRecord[];
  speciesSummary: Array<{ species: string; count: number }>;
};

function groupCatchesByPlace(catches: CatchRecord[]): TripGroup[] {
  const grouped = new Map<string, CatchRecord[]>();

  for (const catchRecord of catches) {
    const key = catchRecord.place.trim().toLowerCase();
    const records = grouped.get(key) ?? [];
    records.push(catchRecord);
    grouped.set(key, records);
  }

  return Array.from(grouped.entries())
    .map(([placeKey, entries]) => {
      const sortedEntries = [...entries].sort((leftCatch, rightCatch) => {
        const leftDate = new Date(leftCatch.date).getTime();
        const rightDate = new Date(rightCatch.date).getTime();

        if (Number.isNaN(leftDate) || Number.isNaN(rightDate)) {
          return 0;
        }

        return rightDate - leftDate;
      });

      const speciesMap = new Map<string, number>();

      for (const catchRecord of sortedEntries) {
        speciesMap.set(catchRecord.species, (speciesMap.get(catchRecord.species) ?? 0) + catchRecord.fishCount);
      }

      return {
        id: placeKey,
        place: sortedEntries[0]?.place ?? placeKey,
        latestDate: sortedEntries[0]?.date ?? "",
        totalFishCount: sortedEntries.reduce((sum, catchRecord) => sum + catchRecord.fishCount, 0),
        entries: sortedEntries,
        speciesSummary: Array.from(speciesMap.entries())
          .sort((leftEntry, rightEntry) => rightEntry[1] - leftEntry[1])
          .map(([species, count]) => ({ species, count }))
          .slice(0, 3),
      };
    })
    .sort((leftGroup, rightGroup) => {
      const leftDate = new Date(leftGroup.latestDate).getTime();
      const rightDate = new Date(rightGroup.latestDate).getTime();

      if (Number.isNaN(leftDate) || Number.isNaN(rightDate)) {
        return 0;
      }

      return rightDate - leftDate;
    });
}

function emptyDraft(): StatsFormDraft {
  return {
    date: todayForInput(),
    place: "",
    species: "",
    fishCount: "1",
    biggestFishName: "",
    biggestFishWeight: "",
  };
}

function sortByDateDescending(catches: CatchRecord[]) {
  return [...catches].sort((leftCatch, rightCatch) => {
    const leftDate = new Date(leftCatch.date).getTime();
    const rightDate = new Date(rightCatch.date).getTime();

    if (Number.isNaN(leftDate) || Number.isNaN(rightDate)) {
      return 0;
    }

    return rightDate - leftDate;
  });
}

function TripPreview({ fishCount, mapHref, ariaLabel }: { fishCount: string; mapHref?: string; ariaLabel: string }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#d8f4d6_0%,#bff0e4_28%,#dff6c5_58%,#b5e2f7_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8)_0,transparent_18%),radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.55)_0,transparent_16%),radial-gradient(circle_at_52%_74%,rgba(56,189,248,0.34)_0,transparent_24%)]" />
      <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-blue-600/85 text-white shadow-lg">
        <MapPinned className="h-5 w-5" />
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-md">
        {fishCount}
      </div>
      {mapHref ? (
        <Link
          href={mapHref}
          aria-label={ariaLabel}
          className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-white"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      ) : (
        <div className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg">
          <ArrowRight className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function EntrySummary({
  entry,
  language,
  resolveSpeciesName,
}: {
  entry: CatchRecord;
  language: LanguageCode;
  resolveSpeciesName: (value: string) => string;
}) {
  const ui = getUiCopy(language).stats;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateLabel(entry.date)}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {resolveSpeciesName(entry.species)} · {formatFishCount(language, entry.fishCount)}
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {entry.biggestFishName.trim() ? (
            <span>
              {ui.trophyLabel}: {entry.biggestFishName}
            </span>
          ) : (
            <span>{ui.noTrophyLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

type ConfirmAction =
  | { type: "clear" }
  | { type: "delete"; id: string }
  | null;

function ConfirmDialog({
  open,
  language,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  language: LanguageCode;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const ui = getUiCopy(language).stats;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-md">
      <button type="button" aria-label={ui.cancel} className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-600 dark:text-red-300">
            {ui.confirmHeading}
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {ui.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCatchDialog({
  open,
  language,
  onClose,
  onSubmit,
}: {
  open: boolean;
  language: LanguageCode;
  onClose: () => void;
  onSubmit: (catchInput: CatchInput) => void;
}) {
  const ui = getUiCopy(language).stats;
  const [draft, setDraft] = useState<StatsFormDraft>(() => emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placeOpen, setPlaceOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft());
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fishCount = Number(draft.fishCount);
    const biggestFishWeight = Number(draft.biggestFishWeight);

    const newErrors: Record<string, string> = {};

    if (!draft.date) newErrors.date = ui.requiredField;
    if (!draft.place.trim()) newErrors.place = ui.requiredField;
    if (!draft.species.trim()) newErrors.species = ui.requiredField;
    if (!Number.isFinite(fishCount) || fishCount <= 0) newErrors.fishCount = ui.invalidNumber;

    // biggest fish is optional: validate weight only when a name is provided
    const providedBiggestName = String(draft.biggestFishName).trim();
    const providedBiggestWeight = Number(draft.biggestFishWeight);
    if (providedBiggestName && (!Number.isFinite(providedBiggestWeight) || providedBiggestWeight <= 0)) {
      newErrors.biggestFishWeight = ui.invalidNumber;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onSubmit({
      date: draft.date,
      place: draft.place.trim(),
      species: capitalizeFirstLetter(draft.species.trim()),
      fishCount: Math.max(1, Math.round(fishCount)),
      biggestFishName: providedBiggestName,
      biggestFishWeight: Number.isFinite(providedBiggestWeight) && providedBiggestWeight > 0 ? providedBiggestWeight : 0,
    });
    onClose();
  };

  function validateField(name: keyof StatsFormDraft) {
    const value = (draft as any)[name];
    if (name === "fishCount" || name === "biggestFishWeight") {
      const num = Number(value);
      if (name === "fishCount") {
        if (!Number.isFinite(num) || num <= 0) {
          setErrors((e) => ({ ...e, [name]: ui.invalidNumber }));
          return false;
        }
      } else {
        // biggestFishWeight is optional: clear error if empty or valid
        if (!String(value).trim()) {
          setErrors((e) => {
            const copy = { ...e };
            delete copy[name];
            return copy;
          });
          return true;
        }

        if (!Number.isFinite(num) || num <= 0) {
          setErrors((e) => ({ ...e, [name]: ui.invalidNumber }));
          return false;
        }
      }
      setErrors((e) => {
        const copy = { ...e };
        delete copy[name];
        return copy;
      });
      return true;
    }

    if (!value || String(value).trim() === "") {
      setErrors((e) => ({ ...e, [name]: ui.requiredField }));
      return false;
    }

    setErrors((e) => {
      const copy = { ...e };
      delete copy[name];
      return copy;
    });
    return true;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label={ui.cancel} className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/70 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">{ui.addCatch}</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{ui.formTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{ui.formDescription}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>{ui.date}</span>
            <DatePicker
              value={draft.date}
              onChange={(v) => setDraft((current) => ({ ...current, date: v }))}
              placeholder={ui.date}
              locale={language}
            />
            {errors.date ? <p className="mt-2 text-xs text-red-600">{errors.date}</p> : null}
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200 relative">
            <span>{ui.place}</span>
            <div className="relative">
              <input
                type="text"
                value={draft.place}
                onChange={(event) => setDraft((current) => ({ ...current, place: event.target.value }))}
                onFocus={() => setPlaceOpen(true)}
                onBlur={() => setTimeout(() => { validateField("place"); setPlaceOpen(false); }, 120)}
                placeholder={ui.placePlaceholder}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />

              {placeOpen && (((waterCardsData as unknown) as Record<string, any>)[language] ?? ((waterCardsData as unknown) as Record<string, any>).en).filter((w: any) => w.name.toLowerCase().includes(draft.place.toLowerCase())).slice(0,8).length > 0 ? (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  {(((waterCardsData as unknown) as Record<string, any>)[language] ?? ((waterCardsData as unknown) as Record<string, any>).en)
                    .filter((w: any) => w.name.toLowerCase().includes(draft.place.toLowerCase()))
                    .slice(0, 8)
                    .map((w: any) => (
                      <button
                        key={w.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setDraft((c) => ({ ...c, place: w.name }));
                          setPlaceOpen(false);
                          setErrors((e) => { const copy = { ...e }; delete copy.place; return copy; });
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{w.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{w.place}</div>
                      </button>
                    ))}
                </div>
              ) : null}
            </div>
            {errors.place ? <p className="mt-2 text-xs text-red-600">{errors.place}</p> : null}
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200 relative">
            <span>{ui.species}</span>
            <input
              type="text"
              value={draft.species}
              onChange={(event) => {
                setDraft((current) => ({ ...current, species: capitalizeFirstLetter(event.target.value) }));
              }}
              onBlur={() => validateField("species")}
                placeholder={ui.speciesPlaceholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {errors.species ? <p className="mt-2 text-xs text-red-600">{errors.species}</p> : null}
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>{ui.fishCount}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={draft.fishCount}
              onChange={(event) => setDraft((current) => ({ ...current, fishCount: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {errors.fishCount ? <p className="mt-2 text-xs text-red-600">{errors.fishCount}</p> : null}
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>{ui.biggestFishName}</span>
            <input
              type="text"
              value={draft.biggestFishName}
              onChange={(event) => setDraft((current) => ({ ...current, biggestFishName: event.target.value }))}
                placeholder={ui.biggestFishNamePlaceholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <p className="mt-2 text-xs text-slate-500">{ui.optionalHint}</p>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>{ui.biggestFishWeight}</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={draft.biggestFishWeight}
              onChange={(event) => setDraft((current) => ({ ...current, biggestFishWeight: event.target.value }))}
                placeholder={ui.biggestFishWeightPlaceholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {errors.biggestFishWeight ? <p className="mt-2 text-xs text-red-600">{errors.biggestFishWeight}</p> : <p className="mt-2 text-xs text-slate-500">{ui.emptyWeightHint}</p>}
          </label>

          <div className="sm:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {ui.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {ui.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StatsDashboard() {
  const { language, catches, addCatch, removeCatch, clearCatches, user, openAuth } = useAppUI();
  const copy = getUiCopy(language);
  const ui = copy.stats;
  const resolveSpeciesName = useMemo(
    () => buildLocalizedNameResolver(fishCardsData as Record<string, NamedCard[]>, language),
    [language],
  );
  const resolveWaterName = useMemo(
    () => buildLocalizedNameResolver(waterCardsData as Record<string, NamedCard[]>, language),
    [language],
  );
  const [isAddCatchOpen, setIsAddCatchOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const sortedCatches = useMemo(() => sortByDateDescending(catches), [catches]);
  const totalCatches = useMemo(
    () => sortedCatches.reduce((sum, catchRecord) => sum + catchRecord.fishCount, 0),
    [sortedCatches],
  );
  const biggestCatch = useMemo(() => {
    const catchesWithTrophy = sortedCatches.filter((catchRecord) => catchRecord.biggestFishName.trim().length > 0 && catchRecord.biggestFishWeight > 0);

    if (catchesWithTrophy.length === 0) {
      return null;
    }

    return [...catchesWithTrophy].sort((leftCatch, rightCatch) => rightCatch.biggestFishWeight - leftCatch.biggestFishWeight)[0] ?? null;
  }, [sortedCatches]);
  const recentTripGroups = useMemo(() => groupCatchesByPlace(sortedCatches).slice(0, 3), [sortedCatches]);
  const speciesStats = useMemo(() => {
    const speciesMap = new Map<string, number>();

    for (const catchRecord of sortedCatches) {
      speciesMap.set(catchRecord.species, (speciesMap.get(catchRecord.species) ?? 0) + catchRecord.fishCount);
    }

    return Array.from(speciesMap.entries())
      .sort((leftEntry, rightEntry) => rightEntry[1] - leftEntry[1])
      .map(([name, count], index) => ({
        name: resolveSpeciesName(name),
        count,
        accent: speciesAccentClasses[index % speciesAccentClasses.length],
      }))
      .slice(0, 6);
  }, [resolveSpeciesName, sortedCatches]);

  const hasCatches = sortedCatches.length > 0;
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const confirmDialog =
    confirmAction === null
      ? null
      : confirmAction.type === "clear"
        ? {
            title: ui.confirmClearTitle,
            description: ui.confirmClearDescription,
            confirmLabel: ui.confirmClearLabel,
            onConfirm: () => clearCatches(),
          }
        : {
            title: ui.confirmDeleteTitle,
            description: ui.confirmDeleteDescription,
            confirmLabel: ui.confirmDeleteLabel,
            onConfirm: () => removeCatch(confirmAction.id),
          };

  return (
    <>
      <ConfirmDialog
        open={confirmAction !== null}
        language={language}
        title={confirmDialog?.title ?? ""}
        description={confirmDialog?.description ?? ""}
        confirmLabel={confirmDialog?.confirmLabel ?? ""}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmAction(null);
        }}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 transition-colors duration-200 sm:px-6 lg:px-8 lg:py-8 dark:bg-slate-950">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">{copy.stats.label}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            {copy.stats.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            {copy.stats.description}
          </p>
        </section>

        {hasCatches ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{copy.stats.recentTripsTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {copy.stats.recentTripsDescription}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          openAuth("login");
                          return;
                        }

                        setIsAddCatchOpen(true);
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {ui.addCatch}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ type: "clear" })}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {ui.clearAll}
                    </button>
                    <Link
                      href="/map"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-400/40 dark:hover:text-blue-300"
                    >
                      {copy.stats.goToMap}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {recentTripGroups.map((tripGroup) => {
                    const isOpen = openGroupId === tripGroup.id;

                    return (
                      <article
                        key={tripGroup.id}
                        className="relative rounded-[1.75rem] border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:hover:border-blue-400/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <TripPreview
                              fishCount={formatFishCount(language, tripGroup.totalFishCount)}
                              mapHref={`/map?spot=${encodeURIComponent(resolveWaterName(tripGroup.place))}`}
                              ariaLabel={copy.stats.goToMap}
                            />
                            <div className="mt-4 flex flex-col gap-2">
                              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {resolveWaterName(tripGroup.place)}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {tripGroup.entries.length} {ui.visitsLabel} · {tripGroup.totalFishCount} {ui.fishLabel}
                              </p>
                              {tripGroup.speciesSummary.length > 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {tripGroup.speciesSummary.map((item) => `${item.count} ${resolveSpeciesName(item.species)}`).join(" · ")}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => setOpenGroupId(isOpen ? null : tripGroup.id)}
                              className="inline-flex h-8 items-center justify-center rounded-full bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                            >
                              {isOpen ? ui.hideDetailsLabel : ui.detailsLabel}
                            </button>
                          </div>
                        </div>

                        {isOpen ? (
                          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <div className="grid gap-3 sm:grid-cols-2">
                              {tripGroup.entries.map((entry) => (
                                <EntrySummary
                                  key={entry.id}
                                  entry={entry}
                                  language={language}
                                  resolveSpeciesName={resolveSpeciesName}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-center text-lg font-bold text-slate-700 dark:text-slate-200">{copy.stats.totalCatchesTitle}</p>
                <div className="mt-6 text-center text-5xl font-black text-slate-900 dark:text-slate-100">{totalCatches}</div>
                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  {copy.stats.totalCatchesCaption}
                </div>
              </div>

              {biggestCatch ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{copy.stats.biggestFishTitle}</p>
                  <div className="mt-4 flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{biggestCatch.biggestFishName}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {formatDateLabel(biggestCatch.date)} · {biggestCatch.place}
                      </p>
                      <div className="mt-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="flex items-center justify-center rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-slate-900">
                          <Fish className="h-16 w-16 text-amber-700" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-10 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <Scale className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <span>{biggestCatch.biggestFishWeight} kg</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <span>{formatDateLabel(biggestCatch.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-center text-lg font-bold text-slate-700 dark:text-slate-200">{copy.stats.successBySpeciesTitle}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {speciesStats.map((species) => (
                    <div
                      key={species.name}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:gap-3 dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <Fish className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium leading-tight text-slate-900 dark:text-slate-100">{species.name}</p>
                      </div>
                      <div className={`shrink-0 text-sm font-bold whitespace-nowrap sm:text-right ${species.accent}`}>
                        {formatFishCount(language, species.count)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <Fish className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-slate-100">{ui.emptyTitle}</h2>
                <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{ui.emptyDescription}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuth("login");
                      return;
                    }

                    setIsAddCatchOpen(true);
                  }}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {ui.addCatch}
                </button>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{ui.addCatchHint}</p>
              </div>
            </section>
          </div>
        )}
      </main>

      <AddCatchDialog
        open={isAddCatchOpen}
        language={language}
        onClose={() => setIsAddCatchOpen(false)}
        onSubmit={addCatch}
      />
    </>
  );
}
