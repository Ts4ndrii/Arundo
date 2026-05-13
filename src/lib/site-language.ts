import type { LanguageCode } from "@/lib/ui-copy";

export const languageCookieName = "arundo-language";
const supportedLanguageCodes: LanguageCode[] = ["uk", "en", "pl"];

export function resolveLanguageCode(value: string | undefined | null): LanguageCode {
  return supportedLanguageCodes.includes(value as LanguageCode) ? (value as LanguageCode) : "uk";
}