"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { Logo } from "@/components/layout/Logo";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

function wasDismissedRecently(): boolean {
  if (typeof localStorage === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Date.now() - ts < DISMISS_DURATION_MS;
}

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || wasDismissedRecently()) return;

    // Android / Chrome — capture the native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS — show a manual instructions banner
    if (isIos()) {
      setShowIosBanner(true);
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-pwa-slide-up">
      <div className="mx-auto max-w-md rounded-2xl border border-[color:var(--accent-border)] bg-[color:var(--surface-strong)] p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <Logo size={40} className="shrink-0 rounded-xl" />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[color:var(--text-strong)]">
              {t.pwa.installTitle}
            </p>

            {showIosBanner ? (
              <p className="mt-1 text-xs text-[color:var(--text-soft)] leading-relaxed">
                {t.pwa.iosInstructions}{" "}
                <span className="inline-flex items-center align-middle">
                  <ShareIcon />
                </span>{" "}
                puis <strong>&quot;{t.pwa.iosAddToHome}&quot;</strong> {t.pwa.iosToInstall}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                {t.pwa.offlineAccess}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label={t.pwa.close}
            className="shrink-0 rounded-lg p-1 text-[color:var(--text-soft)] hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Install button (Android/Chrome only) */}
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full rounded-xl bg-[color:var(--accent)] py-2.5 text-sm font-semibold text-white btn-raised border-b-[color:var(--accent-strong)] hover:bg-[color:var(--accent-strong)] transition-colors"
          >
            {t.pwa.install}
          </button>
        )}
      </div>
    </div>
  );
}

/** iOS share icon (box-with-arrow) */
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--accent)]">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
