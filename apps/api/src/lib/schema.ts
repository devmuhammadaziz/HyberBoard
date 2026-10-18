export const SUBJECTS = ["math", "physics", "chemistry"] as const;
export const LOCALES = ["en", "ru", "kk"] as const;
export const THEMES = ["light", "dark"] as const;
export const ROLES = ["teacher", "professor", "tutor", "student"] as const;

export type SubjectValue = (typeof SUBJECTS)[number];
export type LocaleValue = (typeof LOCALES)[number];
export type ThemeValue = (typeof THEMES)[number];
export type RoleValue = (typeof ROLES)[number];

export function isSubject(v: unknown): v is SubjectValue {
  return typeof v === "string" && (SUBJECTS as readonly string[]).includes(v);
}

export function isLocale(v: unknown): v is LocaleValue {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export function isTheme(v: unknown): v is ThemeValue {
  return typeof v === "string" && (THEMES as readonly string[]).includes(v);
}

export function isRole(v: unknown): v is RoleValue {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}
