import { useState, useEffect } from "react";
import { Download, X, Sparkles, HeartHandshake } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY_INSTALLED = "kck_kruh_pwa_installed";
const STORAGE_KEY_DISMISSED = "kruh_pwa_dismissed_until";
// 14 days cooldown if dismissed
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export function PwaInstallBanner() {
  const { lang } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Only show banner on mobile/small screen devices
    const isMobile = window.innerWidth < 768 || window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    // 2. Check if already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem(STORAGE_KEY_INSTALLED) === "true" ||
      localStorage.getItem("kck_pwa_installed") === "true";

    if (isInstalled) {
      return;
    }

    // 3. Check if recently dismissed
    const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const installedHandler = () => {
      setIsVisible(false);
      localStorage.setItem(STORAGE_KEY_INSTALLED, "true");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // Show popup after brief delay if not dismissed and not installed
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_INSTALLED, "true");
        }
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for iOS Safari and mobile browsers without prompt
      alert(
        lang === "sl"
          ? "Za namestitev aplikacije Kruh življenja na telefon izberite »Dodaj na začetni zaslon« v meniju brskalnika."
          : 'To install Bread of Life on your home screen, tap "Add to Home Screen" in your browser menu.'
      );
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_DISMISSED, (Date.now() + DISMISS_COOLDOWN_MS).toString());
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="md:hidden fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#26170E] text-white p-4 rounded-2xl shadow-2xl border border-amber-700/40 animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#A06F3A] text-white flex items-center justify-center font-black text-sm border border-amber-400/30 shadow-xs">
            <HeartHandshake className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
              <span>{lang === "sl" ? "Namestite Kruh življenja" : "Install Bread of Life App"}</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[10px] text-amber-200/90">
              {lang === "sl"
                ? "Razdeljevanje hrane, urnik & obvestila"
                : "Food distribution, schedules & alerts"}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 rounded-xl bg-[#A06F3A] hover:bg-[#8B5E34] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-amber-400/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === "sl" ? "Namesti aplikacijo" : "Add to Home Screen"}</span>
        </button>
        <button
          onClick={handleDismiss}
          className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer"
        >
          {lang === "sl" ? "Kasneje" : "Later"}
        </button>
      </div>
    </div>
  );
}
