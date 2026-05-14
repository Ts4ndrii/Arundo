"use client";

import { createContext, useContext, useEffect, useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  Bell,
  Check,
  Eye,
  EyeOff,
  Globe,
  LockKeyhole,
  Mail,
  MoonStar,
  PencilLine,
  SunMedium,
  X,
  Loader2,
} from "lucide-react";
import headerLogo from "../../pictures/Main logo.png";
import { Header, type HeaderUser } from "@/components/Header";
import { getUiCopy, type LanguageCode } from "@/lib/ui-copy";
import { languageCookieName } from "@/lib/site-language";

// ─── Єдиний ключ токена для всього застосунку ─────────────────
export const TOKEN_KEY = "arundo_token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AuthTab = "login" | "register";
type ThemeMode = "light" | "dark";

export type CatchRecord = {
  id: string;
  date: string;
  place: string;
  species: string;
  fishCount: number;
  biggestFishName: string;
  biggestFishWeight: number;
};

export type CatchInput = Omit<CatchRecord, "id">;

type ModalState =
  | { type: "none" }
  | { type: "auth"; tab: AuthTab }
  | { type: "profile-edit" }
  | { type: "settings" }
  | { type: "support" };

type AppSettings = {
  theme: ThemeMode;
  language: LanguageCode;
  notificationsEnabled: boolean;
};

type AppUIContextValue = {
  user: HeaderUser | null;
  theme: ThemeMode;
  language: LanguageCode;
  favoriteWaterIds: string[];
  catches: CatchRecord[];
  openAuth: (tab?: AuthTab) => void;
  openProfileEdit: () => void;
  openSettings: () => void;
  openSupport: () => void;
  setFavoriteWaterIds: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  addCatch: (catchInput: CatchInput) => void;
  removeCatch: (id: string) => void;
  clearCatches: () => void;
  closeModal: () => void;
  updateUser: (user: HeaderUser) => void;
  isLoading: boolean;
};

const AppUIContext = createContext<AppUIContextValue | null>(null);

const defaultSettings: AppSettings = {
  theme: "light",
  language: "uk",
  notificationsEnabled: true,
};

const catchesStorageKey = "arundo-catches";

function createCatchId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function normalizeCatchRecords(storedValue: unknown): CatchRecord[] {
  if (!Array.isArray(storedValue)) return [];
  return storedValue.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<CatchRecord>;
    const fishCount = Number(candidate.fishCount);
    const biggestFishWeight = Number(candidate.biggestFishWeight);
    if (
      typeof candidate.date !== "string" ||
      typeof candidate.place !== "string" ||
      typeof candidate.species !== "string" ||
      !Number.isFinite(fishCount) ||
      fishCount <= 0
    )
      return [];
    return [
      {
        id:
          typeof candidate.id === "string" && candidate.id.trim().length > 0
            ? candidate.id
            : `${Date.now()}-${index}`,
        date: candidate.date,
        place: candidate.place,
        species: candidate.species,
        fishCount: Math.max(1, Math.round(fishCount)),
        biggestFishName:
          typeof candidate.biggestFishName === "string"
            ? candidate.biggestFishName
            : "",
        biggestFishWeight:
          Number.isFinite(biggestFishWeight) && biggestFishWeight >= 0
            ? biggestFishWeight
            : 0,
      },
    ];
  });
}

const languageOptions: Array<{
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
}> = [
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська", region: "Україна" },
  { code: "en", label: "English", nativeLabel: "English", region: "United States" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", region: "Polska" },
];

const themeOptions: Array<{ value: ThemeMode; icon: typeof SunMedium }> = [
  { value: "light", icon: SunMedium },
  { value: "dark", icon: MoonStar },
];

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) throw new Error("useAppUI must be used within AppShell");
  return context;
}

// ============================================================
//  MODAL SHELL
// ============================================================
function ModalShell({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[22px]"
      onMouseDown={onClose}
    >
      <div className={className} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
//  FIELD SHELL
// ============================================================
function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

// ============================================================
//  VALIDATION
// ============================================================
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ============================================================
//  PASSWORD FIELD
// ============================================================
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
  toggleLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  toggleLabel: string;
}) {
  return (
    <FieldShell label={label}>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={toggleLabel}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FieldShell>
  );
}

// ============================================================
//  VALIDATION NOTICE
// ============================================================
function ValidationNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm leading-6 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

// ============================================================
//  AUTH MODAL
// ============================================================
function AuthModal({
  open,
  tab,
  onTabChange,
  onClose,
  onComplete,
  copy,
  modalCopy,
}: {
  open: boolean;
  tab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  currentUser: HeaderUser | null;
  onClose: () => void;
  onComplete: (nextUser: HeaderUser) => void;
  copy: ReturnType<typeof getUiCopy>;
  modalCopy: { closeAuth: string };
}) {
  const isLogin = tab === "login";
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [registerConfirmVisible, setRegisterConfirmVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
  }, [tab]);

  useEffect(() => {
    if (!open) {
      setLoginEmail("");
      setLoginPassword("");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setLoginPasswordVisible(false);
      setRegisterPasswordVisible(false);
      setRegisterConfirmVisible(false);
      setLoginError(null);
      setRegisterError(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    if (!isValidEmail(trimmedEmail)) {
      setLoginError(copy.auth.invalidEmail);
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError(copy.auth.passwordRequired);
      return;
    }
    setLoginError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        // ── Зберігаємо токен під єдиним ключем ──────────────
        localStorage.setItem(TOKEN_KEY, data.token);
        // Видаляємо старий ключ якщо був
        localStorage.removeItem("adminToken");
        onComplete({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: data.user.avatarUrl,
          favoriteWaters: data.user.favoriteWaters || [],
        });
        onClose();
      } else {
        setLoginError(data.error || "Помилка входу");
      }
    } catch {
      setLoginError("Помилка підключення до сервера");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = registerName.trim();
    const trimmedEmail = registerEmail.trim();
    if (!trimmedName) {
      setRegisterError(copy.auth.nameRequired);
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setRegisterError(copy.auth.invalidEmail);
      return;
    }
    if (!registerPassword.trim()) {
      setRegisterError(copy.auth.passwordRequired);
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError(copy.auth.passwordMismatch);
      return;
    }
    setRegisterError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: registerPassword,
        }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.removeItem("adminToken");
        onComplete({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: data.user.avatarUrl,
          favoriteWaters: data.user.favoriteWaters || [],
        });
        onClose();
      } else {
        setRegisterError(data.error || "Помилка реєстрації");
      }
    } catch {
      setRegisterError("Помилка підключення до сервера");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="relative w-full max-w-[448px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_36px_72px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative max-h-[calc(100vh-2.5rem)] overflow-y-auto p-5 pr-3 sm:p-7 modal-scrollbar">
        <button
          type="button"
          aria-label={modalCopy.closeAuth}
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <Image
              src={headerLogo}
              alt={copy.header.logoAlt}
              width={44}
              height={44}
              priority
              className="h-9 w-9 object-contain dark:invert dark:brightness-200"
            />
          </div>
          <div className="mt-5 grid w-full grid-cols-2 gap-3 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className={`relative pb-3.5 text-sm font-bold transition sm:text-base ${
                isLogin
                  ? "text-blue-600 after:scale-x-100"
                  : "text-slate-400 after:scale-x-0"
              } after:absolute after:inset-x-0 after:bottom-[-1px] after:h-1 after:rounded-full after:bg-blue-600 after:transition-transform`}
            >
              {copy.auth.loginTab}
            </button>
            <button
              type="button"
              onClick={() => onTabChange("register")}
              className={`relative pb-3.5 text-sm font-bold transition sm:text-base ${
                !isLogin
                  ? "text-blue-600 after:scale-x-100"
                  : "text-slate-400 after:scale-x-0"
              } after:absolute after:inset-x-0 after:bottom-[-1px] after:h-1 after:rounded-full after:bg-blue-600 after:transition-transform`}
            >
              {copy.auth.registerTab}
            </button>
          </div>
        </div>

        {isLogin ? (
          <form className="mt-6 space-y-4" noValidate onSubmit={handleLoginSubmit}>
            <h2 className="mx-auto max-w-[16ch] text-center text-[1.28rem] font-extrabold leading-[1.08] tracking-tight text-slate-800 sm:text-[1.45rem] dark:text-slate-100">
              {copy.auth.loginTitle}
            </h2>
            <ValidationNotice message={loginError} />
            <FieldShell label={copy.auth.emailLabel}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder={copy.auth.emailPlaceholder}
                  className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </FieldShell>
            <PasswordField
              label={copy.auth.passwordLabel}
              value={loginPassword}
              onChange={(v) => {
                setLoginPassword(v);
                if (loginError) setLoginError(null);
              }}
              placeholder={copy.auth.passwordPlaceholder}
              visible={loginPasswordVisible}
              onToggle={() => setLoginPasswordVisible((s) => !s)}
              autoComplete="current-password"
              toggleLabel={
                loginPasswordVisible ? copy.auth.hidePassword : copy.auth.showPassword
              }
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-blue-600/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Вхід...
                </span>
              ) : (
                copy.auth.loginSubmit
              )}
            </button>
            <p className="text-center text-sm text-slate-500">
              {copy.auth.noAccount}{" "}
              <button
                type="button"
                onClick={() => onTabChange("register")}
                className="font-semibold text-blue-600 hover:underline"
              >
                {copy.auth.registerTab}
              </button>
            </p>
          </form>
        ) : (
          <form className="mt-6 space-y-4" noValidate onSubmit={handleRegisterSubmit}>
            <h2 className="text-center text-[1.4rem] font-extrabold leading-[1.08] tracking-tight text-slate-800 sm:text-[1.55rem] dark:text-slate-100">
              {copy.auth.registerTitle}
            </h2>
            <ValidationNotice message={registerError} />
            <FieldShell label={copy.auth.nameLabel}>
              <input
                type="text"
                autoComplete="name"
                value={registerName}
                onChange={(e) => {
                  setRegisterName(e.target.value);
                  if (registerError) setRegisterError(null);
                }}
                placeholder={copy.auth.namePlaceholder}
                className="h-11 w-full rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </FieldShell>
            <FieldShell label={copy.auth.emailLabel}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(e) => {
                    setRegisterEmail(e.target.value);
                    if (registerError) setRegisterError(null);
                  }}
                  placeholder={copy.auth.emailPlaceholder}
                  className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </FieldShell>
            <PasswordField
              label={copy.auth.passwordLabel}
              value={registerPassword}
              onChange={(v) => {
                setRegisterPassword(v);
                if (registerError) setRegisterError(null);
              }}
              placeholder={copy.auth.passwordPlaceholder}
              visible={registerPasswordVisible}
              onToggle={() => setRegisterPasswordVisible((s) => !s)}
              autoComplete="new-password"
              toggleLabel={
                registerPasswordVisible
                  ? copy.auth.hidePassword
                  : copy.auth.showPassword
              }
            />
            <PasswordField
              label={copy.auth.confirmPasswordLabel}
              value={registerConfirmPassword}
              onChange={(v) => {
                setRegisterConfirmPassword(v);
                if (registerError) setRegisterError(null);
              }}
              placeholder={copy.auth.passwordPlaceholder}
              visible={registerConfirmVisible}
              onToggle={() => setRegisterConfirmVisible((s) => !s)}
              autoComplete="new-password"
              toggleLabel={
                registerConfirmVisible
                  ? copy.auth.hidePassword
                  : copy.auth.showPassword
              }
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-blue-600/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Реєстрація...
                </span>
              ) : (
                copy.auth.registerSubmit
              )}
            </button>
            <p className="text-center text-sm text-slate-500">
              {copy.auth.haveAccount}{" "}
              <button
                type="button"
                onClick={() => onTabChange("login")}
                className="font-semibold text-blue-600 hover:underline"
              >
                {copy.auth.loginTab}
              </button>
            </p>
          </form>
        )}
      </div>
    </ModalShell>
  );
}

// ============================================================
//  PROFILE EDIT MODAL
// ============================================================
function ProfileEditModal({
  open,
  user,
  onClose,
  onSave,
  modalCopy,
  copy,
}: {
  open: boolean;
  user: HeaderUser | null;
  onClose: () => void;
  onSave: (nextName: string, nextEmail: string) => void;
  modalCopy: any;
  copy: any;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      const parts = (user.name ?? "").split(/\s+/).filter(Boolean);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setError(null);
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const computedName = `${firstName.trim()} ${lastName.trim()}`.trim() || user?.name || "";
    if (!computedName) {
      setError("Ім'я не може бути порожнім");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: computedName }),
      });
      const data = await res.json();
      if (res.ok) {
        onSave(data.user?.name ?? computedName, user?.email ?? "");
        onClose();
      } else {
        setError(data.error ?? "Помилка збереження");
      }
    } catch {
      setError("Помилка підключення до сервера");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="relative w-full max-w-[520px] rounded-[32px] border border-slate-200 bg-white px-6 py-7 shadow-[0_40px_80px_-24px_rgba(15,23,42,0.45)] sm:px-8 dark:border-slate-800 dark:bg-slate-900"
    >
      <button
        type="button"
        aria-label={modalCopy.closeProfileEdit}
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
      >
        <X className="h-5 w-5" />
      </button>
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
        {modalCopy.profileEditTitle}
      </h2>

      {/* Avatar */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-slate-100 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={modalCopy.profilePhotoAlt ?? "Аватар"}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <span className="text-3xl font-black text-slate-500 select-none">
              {(user?.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {error && <ValidationNotice message={error} />}
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-500">
            {modalCopy.firstName}
          </span>
          <div className="relative">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 w-full rounded-full border border-slate-200 bg-white px-5 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <PencilLine className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-500">
            {modalCopy.lastName}
          </span>
          <div className="relative">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-14 w-full rounded-full border border-slate-200 bg-white px-5 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <PencilLine className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {modalCopy.saveChanges}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-14 items-center justify-center rounded-full border border-blue-500 bg-white px-6 text-base font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
          >
            {modalCopy.cancel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ============================================================
//  SUPPORT MODAL
// ============================================================
function SupportModal({
  open,
  onClose,
  user,
  copy,
}: {
  open: boolean;
  onClose: () => void;
  user: HeaderUser | null;
  copy: ReturnType<typeof getUiCopy>;
}) {
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    reason: "",
    message: "",
  });
  const [messageHeight, setMessageHeight] = useState<string>("auto");

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ta = e.target;
    setFormData((prev) => ({ ...prev, message: ta.value }));
    ta.style.height = "auto";
    setMessageHeight(ta.scrollHeight + "px");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const key = "arundo.support.requests";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        data: formData,
        status: "local",
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    setFormData({ name: user?.name ?? "", email: user?.email ?? "", reason: "", message: "" });
    setMessageHeight("auto");
    onClose();
  };

  const supportCopy = copy.support;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="relative w-full max-w-[680px] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto p-5 pr-3 sm:p-7 modal-scrollbar">
        <button
          type="button"
          aria-label={supportCopy.close}
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {supportCopy.title}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              {supportCopy.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder={supportCopy.namePlaceholder}
              className="mt-2 h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              {supportCopy.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder={copy.auth.emailPlaceholder}
              className="mt-2 h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              {supportCopy.reason}
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
              placeholder={supportCopy.reasonPlaceholder}
              className="mt-2 h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              {supportCopy.message}
            </label>
            <textarea
              value={formData.message}
              onChange={handleMessageChange}
              placeholder={supportCopy.messagePlaceholder}
              style={{ height: messageHeight }}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {supportCopy.send}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}

// ============================================================
//  SETTINGS MODAL
// ============================================================
function SettingsModal({
  open,
  settings,
  onThemeChange,
  onLanguageChange,
  copy,
  onNotificationsChange,
  onClose,
  modalCopy,
}: {
  open: boolean;
  settings: AppSettings;
  onThemeChange: (theme: ThemeMode) => void;
  onLanguageChange: (language: LanguageCode) => void;
  copy: ReturnType<typeof getUiCopy>;
  onNotificationsChange: (value: boolean) => void;
  onClose: () => void;
  modalCopy: { closeSettings: string };
}) {
  const selectedTheme =
    themeOptions.find((o) => o.value === settings.theme) ?? themeOptions[0];
  const selectedLanguage =
    languageOptions.find((o) => o.code === settings.language) ?? languageOptions[0];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="relative w-full max-w-[680px] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto p-5 pr-3 sm:p-7 modal-scrollbar">
        <button
          type="button"
          aria-label={modalCopy.closeSettings}
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
            {copy.settings.badge}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {copy.settings.title}
          </h2>
        </div>
        <div className="mt-7 space-y-4">
          {/* Theme */}
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
                <MoonStar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
                  {copy.settings.themeTitle}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {copy.settings.themeCardTitle}
                </h3>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = selectedTheme.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onThemeChange(option.value)}
                    className={`group rounded-[24px] border p-4 text-left transition ${
                      isActive
                        ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <p className="text-base font-bold">
                        {option.value === "light"
                          ? copy.settings.lightThemeLabel
                          : copy.settings.darkThemeLabel}
                      </p>
                      {isActive && (
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                          {copy.settings.selected}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language */}
          <section className="rounded-[28px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <Globe className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
                  {copy.settings.languageTitle}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {copy.settings.languageCardTitle}
                </h3>
              </div>
            </div>
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1 modal-scrollbar">
                {languageOptions.map((option) => {
                  const isActive = selectedLanguage.code === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => onLanguageChange(option.code)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="min-w-0 flex-1 pr-3">
                        <span className="block text-sm font-semibold">
                          {option.nativeLabel}
                        </span>
                      </span>
                      {isActive ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
                <Bell className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
                  {copy.settings.notificationsTitle}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {copy.settings.notificationsCardTitle}
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.notificationsEnabled}
                onClick={() => onNotificationsChange(!settings.notificationsEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full border p-1 transition ${
                  settings.notificationsEnabled
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    settings.notificationsEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {copy.settings.close}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            {copy.settings.save}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================
//  TOAST
// ============================================================
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-2 duration-300">
      <div
        className={`rounded-lg px-4 py-3 shadow-lg ${
          type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

// ============================================================
//  MAIN APPSHELL
// ============================================================
function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [favoriteWaterIds, setFavoriteWaterIds] = useState<string[]>([]);
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [catchesLoaded, setCatchesLoaded] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const copy = getUiCopy(settings.language);
  const modalCopy = copy.modal;

  // ── Міграція старого ключа токена ────────────────────────────
  useEffect(() => {
    const oldToken = localStorage.getItem("adminToken");
    if (oldToken && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, oldToken);
    }
    if (oldToken) localStorage.removeItem("adminToken");
  }, []);

  // ── Завантаження користувача ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoadingUser(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          const fixedUser: HeaderUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatarUrl: userData.avatarUrl || null,
            favoriteWaters: userData.favoriteWaters || [],
          };
          setUser(fixedUser);
          setFavoriteWaterIds(fixedUser.favoriteWaters || []);
          localStorage.setItem("arundo-user", JSON.stringify(fixedUser));
        } else {
          // Токен невалідний — чистимо
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem("arundo-user");
        }
      } catch {
        // Сервер недоступний — намагаємось із кешу
        const stored = localStorage.getItem("arundo-user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setFavoriteWaterIds(parsed.favoriteWaters || []);
          } catch {}
        }
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // ── Синхронізація улюблених з БД ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !user) return;
    const syncFavorites = async () => {
      try {
        await fetch(`${API_URL}/api/users/favorites`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ favorites: favoriteWaterIds }),
        });
      } catch {}
    };
    syncFavorites();
  }, [favoriteWaterIds, user]);

  // ── Налаштування ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem("arundo-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          theme: parsed.theme === "dark" ? "dark" : defaultSettings.theme,
          language: languageOptions.some((o) => o.code === parsed.language)
            ? parsed.language
            : defaultSettings.language,
          notificationsEnabled:
            typeof parsed.notificationsEnabled === "boolean"
              ? parsed.notificationsEnabled
              : defaultSettings.notificationsEnabled,
        });
      }
    } catch {}
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("arundo-settings", JSON.stringify(settings));
    document.cookie = `${languageCookieName}=${settings.language}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.style.colorScheme = settings.theme;
    document.documentElement.lang = settings.language;
  }, [settings, settingsLoaded]);

  // ── Улови (localStorage — для зворотньої сумісності) ─────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(catchesStorageKey);
      if (stored) setCatches(normalizeCatchRecords(JSON.parse(stored)));
    } catch {}
    setCatchesLoaded(true);
  }, []);

  useEffect(() => {
    if (!catchesLoaded) return;
    if (!user && catches.length > 0) {
      setCatches([]);
      localStorage.removeItem(catchesStorageKey);
    } else if (catches.length > 0) {
      localStorage.setItem(catchesStorageKey, JSON.stringify(catches));
    } else {
      localStorage.removeItem(catchesStorageKey);
    }
  }, [catches, catchesLoaded, user]);

  // ── Заголовок ─────────────────────────────────────────────────
  useEffect(() => {
    const normalized = pathname.replace(/\/$/, "") || "/";
    const titles: Record<string, string> = {
      "/": copy.home.title,
      "/map": `${copy.header.brand} | ${copy.header.navigationItems[1]?.label || "Карта"}`,
      "/wiki": `${copy.header.brand} • ${copy.header.navigationItems[2]?.label || "Енциклопедія"}`,
      "/stats": `${copy.header.brand} | ${copy.header.navigationItems[3]?.label || "Статистика"}`,
      "/catches": `${copy.header.brand} | Мій щоденник`,
      "/profile": `${copy.header.brand} | ${copy.profile.label}`,
    };
    document.title = titles[normalized] || copy.header.brand;
  }, [pathname, copy]);

  useEffect(() => {
    setModalState({ type: "none" });
  }, [pathname]);

  const openAuth = (tab: AuthTab = "login") =>
    setModalState({ type: "auth", tab });
  const openProfileEdit = () => {
    if (!user) openAuth("login");
    else setModalState({ type: "profile-edit" });
  };
  const openSettings = () => setModalState({ type: "settings" });
  const openSupport = () => setModalState({ type: "support" });
  const closeModal = () => setModalState({ type: "none" });

  const handleAuthComplete = (nextUser: HeaderUser) => {
    setUser(nextUser);
    setFavoriteWaterIds(nextUser.favoriteWaters || []);
    closeModal();
  };

  const handleProfileSave = (nextName: string) => {
    setUser((prev) => (prev ? { ...prev, name: nextName } : null));
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("arundo-user");
    setUser(null);
    setFavoriteWaterIds([]);
    closeModal();
    if (pathname !== "/") router.push("/");
  };

  const toggleFavorite = (id: string) => {
    setFavoriteWaterIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const updateUser = (updatedUser: HeaderUser) => {
    setUser(updatedUser);
    localStorage.setItem("arundo-user", JSON.stringify(updatedUser));
  };

  const addCatch = (catchInput: CatchInput) => {
    setCatches((prev) => [{ ...catchInput, id: createCatchId() }, ...prev]);
  };
  const removeCatch = (id: string) =>
    setCatches((prev) => prev.filter((c) => c.id !== id));
  const clearCatches = () => setCatches([]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-slate-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <AppUIContext.Provider
      value={{
        user,
        theme: settings.theme,
        language: settings.language,
        favoriteWaterIds,
        catches,
        openAuth,
        openProfileEdit,
        openSettings,
        openSupport,
        setFavoriteWaterIds,
        toggleFavorite,
        addCatch,
        removeCatch,
        clearCatches,
        closeModal,
        updateUser,
        isLoading: isLoadingUser,
      }}
    >
      <Header
        user={user}
        language={settings.language}
        onLoginClick={() => openAuth("login")}
        onProfileClick={() => router.push("/profile")}
        onSettingsClick={openSettings}
        onLogoutClick={handleLogout}
        onAdminClick={() => router.push("/admin")}
      />
      {children}

      <AuthModal
        open={modalState.type === "auth"}
        tab={modalState.type === "auth" ? modalState.tab : "login"}
        onTabChange={(nextTab) => setModalState({ type: "auth", tab: nextTab })}
        currentUser={user}
        onClose={closeModal}
        onComplete={handleAuthComplete}
        copy={copy}
        modalCopy={modalCopy}
      />

      <ProfileEditModal
        open={modalState.type === "profile-edit"}
        user={user}
        onClose={closeModal}
        onSave={handleProfileSave}
        modalCopy={modalCopy}
        copy={copy}
      />

      <SettingsModal
        open={modalState.type === "settings"}
        settings={settings}
        copy={copy}
        onThemeChange={(theme) => setSettings((s) => ({ ...s, theme }))}
        onLanguageChange={(language) => setSettings((s) => ({ ...s, language }))}
        onNotificationsChange={(enabled) =>
          setSettings((s) => ({ ...s, notificationsEnabled: enabled }))
        }
        onClose={closeModal}
        modalCopy={modalCopy}
      />

      <SupportModal
        open={modalState.type === "support"}
        onClose={closeModal}
        user={user}
        copy={copy}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppUIContext.Provider>
  );
}

export default AppShell;