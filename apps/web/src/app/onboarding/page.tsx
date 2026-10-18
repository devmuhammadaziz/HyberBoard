"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, Subject } from "@smart-desk/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import clsx from "clsx";

const SUBJECTS: Subject[] = ["math", "physics", "chemistry"];
const ROLES = ["teacher", "professor", "tutor", "student"] as const;
const LOCALES: Locale[] = ["en", "ru", "kk"];

export default function OnboardingPage() {
  const { user, loading, refreshUser, locale } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("teacher");
  const [lang, setLang] = useState<Locale>("en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (user.onboarded) router.replace("/board");
    else {
      setLang(user.locale || "en");
      setSubjects((user.subjects as Subject[]) || []);
    }
  }, [user, loading, router]);

  const toggleSubject = (s: Subject) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const finish = async () => {
    if (!subjects.length) {
      setError("Pick at least one subject");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/auth/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          subjects,
          institution,
          role,
          locale: lang,
        }),
      });
      await refreshUser();
      router.push("/board");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center text-[var(--text-secondary)]">
        Loading…
      </main>
    );
  }

  return (
    <main className="hb-grid min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {t(locale, "welcomeBack")}, {user.name.split(" ")[0]}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t(locale, "onboardingTitle")}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Step {step} of 2</p>

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium">{t(locale, "step1")}</h2>
            <div className="grid gap-3">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={clsx(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    subjects.includes(s)
                      ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_12%,transparent)]"
                      : "border-[var(--border)] hover:bg-[var(--bg)]"
                  )}
                >
                  <div className="font-medium">{t(locale, s)}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!subjects.length}
              onClick={() => setStep(2)}
              className="mt-4 w-full rounded-2xl bg-[var(--brand)] px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {t(locale, "continue")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium">{t(locale, "step2")}</h2>
            <label className="block text-sm">
              <span className="text-[var(--text-secondary)]">{t(locale, "institution")}</span>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 outline-none focus:border-[var(--brand)]"
              />
            </label>
            <div className="block text-sm">
              <span className="text-[var(--text-secondary)]">{t(locale, "role")}</span>
              <CustomDropdown
                className="mt-1 w-full [&>button]:w-full [&>button]:justify-between"
                menuClassName="w-full"
                size="md"
                openUp={false}
                value={role}
                onChange={setRole}
                ariaLabel={t(locale, "role")}
                options={ROLES.map((r) => ({
                  value: r,
                  label: t(locale, r),
                }))}
              />
            </div>
            <div className="block text-sm">
              <span className="text-[var(--text-secondary)]">{t(locale, "language")}</span>
              <CustomDropdown
                className="mt-1 w-full [&>button]:w-full [&>button]:justify-between"
                menuClassName="w-full"
                size="md"
                openUp={false}
                value={lang}
                onChange={setLang}
                ariaLabel={t(locale, "language")}
                options={[
                  { value: "en", label: "English", hint: "EN" },
                  { value: "ru", label: "Русский", hint: "RU" },
                  { value: "kk", label: "Қазақша", hint: "KK" },
                ]}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void finish()}
                className="flex-1 rounded-2xl bg-[var(--brand)] px-4 py-3 font-medium text-white disabled:opacity-60"
              >
                {t(locale, "enterBoard")}
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
