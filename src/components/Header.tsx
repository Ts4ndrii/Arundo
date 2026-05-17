"use client";

import { ChevronDown, LogOut, Search, Settings2, Shield, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import headerLogo from "../../pictures/Main logo.png";
import { getUiCopy, type LanguageCode } from "@/lib/ui-copy";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SearchResult = {
  type: "water" | "fish";
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
};

export type HeaderNavigationItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type HeaderUser = {
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
};

export type HeaderProps = {
  navigationItems?: HeaderNavigationItem[];
  activeLabel?: string;
  language?: LanguageCode;
  user?: HeaderUser | null;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onAdminClick?: () => void;
  className?: string;
};

export const defaultHeaderNavigationItems: HeaderNavigationItem[] = [];

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getActiveLabelFromPathname(
  pathname: string | null,
  activeLabels: Record<"/" | "/map" | "/wiki" | "/stats" | "/profile", string>,
) {
  const normalizedPathname = pathname ? pathname.replace(/\/$/, "") : "/";

  return activeLabels[normalizedPathname as keyof typeof activeLabels] ?? activeLabels["/"];
}

export function Header({
  navigationItems = defaultHeaderNavigationItems,
  activeLabel,
  language = "uk",
  user,
  onLoginClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  onAdminClick,
  className,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const copy = getUiCopy(language);
  const visibleNavigationItems = navigationItems.length > 0 ? navigationItems : copy.header.navigationItems;
  const currentActiveLabel = activeLabel ?? getActiveLabelFromPathname(pathname, copy.header.activeLabels) ?? copy.header.activeLabels["/"];
  const isAdmin = user?.role === "admin";

  // Пошук водойм та риб
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const [waterRes, fishRes] = await Promise.all([
        fetch(`${API_URL}/api/water`),
        fetch(`${API_URL}/api/fish`)
      ]);

      const waterData = await waterRes.json();
      const fishData = await fishRes.json();

      const waterResults: SearchResult[] = (Array.isArray(waterData) ? waterData : [])
        .filter((w: any) => w.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map((w: any) => ({
          type: "water",
          id: w._id,
          name: w.name,
          subtitle: w.waterType || "Водойма",
          image: w.images?.[0]?.url,
        }));

      const fishResults: SearchResult[] = (Array.isArray(fishData) ? fishData : [])
        .filter((f: any) => f.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map((f: any) => ({
          type: "fish",
          id: f._id,
          name: f.name,
          subtitle: f.scientificName || "Риба",
          image: f.image?.url,
        }));

      setSearchResults([...waterResults, ...fishResults].slice(0, 10));
    } catch (error) {
      console.error("Помилка пошуку:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Дебаунс для пошуку
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Закриття результатів при кліку поза
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [pathname]);

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    
    if (result.type === "water") {
      router.push(`/wiki?water=${result.id}`);
    } else {
      router.push(`/wiki?fish=${result.id}`);
    }
  };

  const rootClassName = [
    "sticky top-0 z-[1100] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={rootClassName}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <Image
              src={headerLogo}
              alt={copy.header.logoAlt}
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain p-1 dark:invert dark:brightness-200"
            />
          </span>
          <span className="text-lg font-extrabold tracking-[0.32em] text-slate-900 dark:text-slate-100">
            {copy.header.brand}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-4" ref={searchRef}>
          {/* Пошук з результатами */}
          <div className="relative min-w-0 flex-1 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder={copy.header.searchPlaceholder || "Пошук водойм, риб..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-100 pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Випадаючий список результатів */}
            {isSearchOpen && (searchQuery || searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 top-full z-[1200] mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                          {result.type === "water" ? (
                            <span className="text-lg">💧</span>
                          ) : (
                            <span className="text-lg">🐟</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {result.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {result.type === "water" ? "Водойма" : "Риба"} • {result.subtitle}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">→</span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Нічого не знайдено
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="hidden items-center justify-center gap-8 whitespace-nowrap lg:flex">
            {visibleNavigationItems.map((item: HeaderNavigationItem) => {
              const isActive = item.label === currentActiveLabel;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "relative pb-1 text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-blue-600 after:transition-transform",
                    isActive
                      ? "text-blue-600 after:scale-x-100 dark:text-blue-400"
                      : "text-slate-600 after:scale-x-0 hover:text-slate-900 hover:after:scale-x-100 dark:text-slate-300 dark:hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0" ref={profileMenuRef}>
          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((currentState) => !currentState)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  style={
                    user.avatarUrl
                      ? {
                          backgroundImage: `url(${user.avatarUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {user.avatarUrl ? null : getUserInitials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                  {user.email ? (
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                  ) : null}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </button>

              {isProfileMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onProfileClick?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <UserRound className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {copy.header.profile}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSettingsClick?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Settings2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {copy.header.settings}
                  </button>
                  
                  {isAdmin && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onAdminClick?.();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-orange-600 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                      <Shield className="h-4 w-4 text-orange-500" />
                      Адмін панель
                    </button>
                  )}
                  
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogoutClick?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {copy.header.logout}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 dark:shadow-blue-600/10"
            >
              {copy.header.loginRegister}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;