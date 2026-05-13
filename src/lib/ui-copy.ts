export type LanguageCode = "uk" | "en" | "pl";

import enLocale from "../locales/en.json";
import ukLocale from "../locales/uk.json";
import plLocale from "../locales/pl.json";

type NavigationItem = { label: string; href: string };

export type UiCopy = {
  header: {
    navigationItems: NavigationItem[];
    activeLabels: Record<"/" | "/map" | "/wiki" | "/stats" | "/profile", string>;
    searchPlaceholder: string;
    loginRegister: string;
    profile: string;
    settings: string;
    logout: string;
    logoAlt: string;
    brand: string;
  };
  home: {
    badge: string;
    title: string;
    description: string;
    ctaRegister: string;
    ctaMap: string;
    heroImageAlt: string;
    features: Array<{ title: string; description: string }>;
  };
  profile: {
    label: string;
    heading: string;
    editProfile: string;
    supportAriaLabel: string;
    settingsAriaLabel: string;
    photosTitle: string;
    viewAll: string;
    awardsTitle: string;
    favoritePlaceTitle: string;
    goToMap: string;
    loginToAccount: string;
    guestName: string;
    guestEmail: string;
    intro: string;
    favoriteBadge: string;
    removeFavoriteAria: string;
    depthLabel: string;
    accessLabel: string;
    viewDetails: string;
    emptyFavoriteDescription: string;
    emptyFavoriteCta: string;
  };
  auth: {
    loginTab: string;
    registerTab: string;
    loginTitle: string;
    registerTitle: string;
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loginSubmit: string;
    registerSubmit: string;
    noAccount: string;
    haveAccount: string;
    continueWith: string;
    invalidEmail: string;
    passwordRequired: string;
    nameRequired: string;
    passwordMismatch: string;
    showPassword: string;
    hidePassword: string;
    socialApple: string;
    socialGoogle: string;
    socialAppleEmail: string;
    socialGoogleEmail: string;
  };
  settings: {
    badge: string;
    title: string;
    themeTitle: string;
    themeCardTitle: string;
    lightThemeLabel: string;
    lightThemeDescription: string;
    darkThemeLabel: string;
    darkThemeDescription: string;
    languageTitle: string;
    languageCardTitle: string;
    notificationsTitle: string;
    notificationsCardTitle: string;
    save: string;
    close: string;
    selected: string;
  };
  map: {
    label: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    nearbyTitle: string;
    nearbyEmpty: string;
    activePointLabel: string;
    activePointDescription: string;
    openStats: string;
    mapTitle: string;
    hint: string;
    locationButton: string;
    locationReady: string;
    locationSuccess: string;
    locationDenied: string;
    locationUnsupported: string;
    quickTitle: string;
    quickDescription: string;
    quickButton: string;
    zoomIn: string;
    zoomOut: string;
    locationApprox: string;
    nearbyWithin: string;
    noNearbySpots: string;
    youAreHere: string;
    currentLocationBrowser: string;
  };
  wiki: {
    label: string;
    title: string;
    description: string;
    filterTitle: string;
    filterDescription: string;
    searchPlaceholder: string;
    catalogLabel: string;
    listTitle: string;
    detailTitle: string;
    listTab: string;
    detailTab: string;
    speciesLabel: string;
    lengthLabel: string;
    weightLabel: string;
    descriptionCardTitle: string;
    habitatCardTitle: string;
    feedingCardTitle: string;
    speciesTypeLabel: string;
    accessLabel: string;
    detailsCTA: string;
    filterSections: {
      waterType: string;
      targetFish: string;
      size: string;
    };
    waterTypes: string[];
    targetFish: string[];
    sizeOptions: string[];
    photoLabel: string;
    backToMap: string;
    waterPageTitle: string;
    targetFishLabel: string;
    coordinatesLabel: string;
    addFavoriteAria: string;
    removeFavoriteAria: string;
    feedingFallback: string;
  };
  stats: {
    label: string;
    title: string;
    description: string;
    recentTripsTitle: string;
    recentTripsDescription: string;
    goToMap: string;
    totalCatchesTitle: string;
    totalCatchesCaption: string;
    biggestFishTitle: string;
    successBySpeciesTitle: string;
    countByDay: string;
    countByWeek: string;
    countByMonth: string;
    addCatch: string;
    emptyTitle: string;
    emptyDescription: string;
    addCatchHint: string;
    formTitle: string;
    formDescription: string;
    cancel: string;
    save: string;
    date: string;
    place: string;
    species: string;
    fishCount: string;
    biggestFishName: string;
    biggestFishWeight: string;
    placePlaceholder: string;
    speciesPlaceholder: string;
    biggestFishNamePlaceholder: string;
    biggestFishWeightPlaceholder: string;
    optionalHint: string;
    emptyWeightHint: string;
    clearAll: string;
    visitsLabel: string;
    fishLabel: string;
    detailsLabel: string;
    hideDetailsLabel: string;
    trophyLabel: string;
    noTrophyLabel: string;
    confirmClearTitle: string;
    confirmClearDescription: string;
    confirmClearLabel: string;
    confirmDeleteTitle: string;
    confirmDeleteDescription: string;
    confirmDeleteLabel: string;
    requiredField: string;
    invalidNumber: string;
    confirmHeading: string;
  };
  modal: {
    closeAuth: string;
    closeProfileEdit: string;
    profileEditTitle: string;
    profilePhotoAlt: string;
    changePhoto: string;
    firstName: string;
    lastName: string;
    saveChanges: string;
    cancel: string;
    closeSettings: string;
  };
  support: {
    title: string;
    name: string;
    email: string;
    reason: string;
    message: string;
    send: string;
    close: string;
    namePlaceholder: string;
    reasonPlaceholder: string;
    messagePlaceholder: string;
  };
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeLocalizedDeep<T>(english: T, locale?: Partial<T>, fallback?: Partial<T>): T {
  if (Array.isArray(english)) {
    const localeArray = Array.isArray(locale) ? locale : undefined;
    const fallbackArray = Array.isArray(fallback) ? fallback : undefined;

    if (localeArray && JSON.stringify(localeArray) !== JSON.stringify(english)) {
      return localeArray as unknown as T;
    }

    if (fallbackArray && JSON.stringify(fallbackArray) !== JSON.stringify(english)) {
      return fallbackArray as unknown as T;
    }

    return (localeArray ?? fallbackArray ?? english) as unknown as T;
  }

  if (!isPlainObject(english)) {
    const localeValue = locale as unknown;
    const fallbackValue = fallback as unknown;

    if (localeValue !== undefined && localeValue !== english) {
      return localeValue as T;
    }

    if (fallbackValue !== undefined && fallbackValue !== english) {
      return fallbackValue as T;
    }

    return (localeValue ?? fallbackValue ?? english) as T;
  }

  const result: Record<string, unknown> = {};
  const localeObject = isPlainObject(locale) ? (locale as Record<string, unknown>) : undefined;
  const fallbackObject = isPlainObject(fallback) ? (fallback as Record<string, unknown>) : undefined;

  for (const key of Object.keys(english)) {
    result[key] = mergeLocalizedDeep(
      (english as Record<string, unknown>)[key],
      localeObject ? (localeObject[key] as any) : undefined,
      fallbackObject ? (fallbackObject[key] as any) : undefined,
    );
  }

  return result as T;
}

export function getUiCopy(language: LanguageCode): UiCopy {
  const jsonMap: Record<LanguageCode, Partial<UiCopy>> = {
    en: enLocale as any,
    uk: ukLocale as any,
    pl: plLocale as any,
  };

  const base = enLocale as unknown as UiCopy;
  const partial = jsonMap[language];
  if (!partial) return base;
  if (language === "en") return base;
  return mergeLocalizedDeep(base, partial as Partial<UiCopy>, ukLocale as Partial<UiCopy>);
}
