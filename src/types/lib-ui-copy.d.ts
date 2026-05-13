declare module "@/lib/ui-copy" {
  export type LanguageCode = "uk" | "en" | "pl";
  export type UiCopy = any;

  export function getUiCopy(language: LanguageCode): UiCopy;

  // allow importing the type directly
  export { };
}

declare module "@/locales/*" {
  const value: any;
  export default value;
}

declare module "@/data/*" {
  const value: any;
  export default value;
}

declare module "*.json" {
  const value: any;
  export default value;
}
