import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getUiCopy, type LanguageCode } from "@/lib/ui-copy";
import { languageCookieName, resolveLanguageCode } from "@/lib/site-language";

export function getLanguageFromCookies(): LanguageCode {
  return resolveLanguageCode(cookies().get(languageCookieName)?.value);
}

export function buildRouteMetadata(route: "home" | "map" | "wiki" | "stats" | "profile"): Pick<Metadata, "title" | "description"> {
  const copy = getUiCopy(getLanguageFromCookies());

  switch (route) {
    case "map":
      return {
        title: `${copy.header.brand} | ${copy.header.navigationItems[1].label}`,
        description: copy.map.description,
      };
    case "wiki":
      return {
        title: `${copy.header.brand} • ${copy.header.navigationItems[2].label}`,
        description: copy.wiki.description,
      };
    case "stats":
      return {
        title: `${copy.header.brand} | ${copy.header.navigationItems[3].label}`,
        description: copy.stats.description,
      };
    case "profile":
      return {
        title: `${copy.header.brand} | ${copy.profile.label}`,
        description: copy.profile.heading,
      };
    case "home":
    default:
      return {
        title: copy.home.title,
        description: copy.home.description,
      };
  }
}