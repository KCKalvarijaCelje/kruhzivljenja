import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { EcosystemAppsDropdown, EcosystemAppKey } from './EcosystemAppsDropdown';
import {
  Youtube,
  Facebook,
  Instagram,
  Radio,
  LogOut,
  Download,
  Smartphone,
} from 'lucide-react';

export interface EcosystemUser {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

export interface EcosystemNavbarProps {
  currentApp: EcosystemAppKey;
  subAppSubtitle?: string;
  user?: EcosystemUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
  currentLang?: 'sl' | 'en';
  onLanguageChange?: (lang: 'sl' | 'en') => void;
  extraNavItems?: React.ReactNode;
  rightActionItems?: React.ReactNode;
  className?: string;
}

const SUB_APP_METAS: Record<EcosystemAppKey, { title: string; subtitle: string }> = {
  main: { title: 'CERKEV', subtitle: 'Uradni portal cerkve' },
  nedelje: { title: 'NEDELJE', subtitle: 'Organizacija nedeljskih bogoslužij KCK' },
  ucenja: { title: 'UČENJA', subtitle: 'Arhiv svetopisemskih naukov in pridig' },
  kruh: { title: 'KRUH ŽIVLJENJA', subtitle: 'Prehranska pomoč & logistika' },
  vodnik: { title: 'OSEBNI VODNIK', subtitle: 'Učeništvo, mentorstvo in navade' },
  zivavera: { title: 'ŽIVA VERA', subtitle: 'Kavarna & skupnostni prostor' },
};

export const EcosystemNavbar: React.FC<EcosystemNavbarProps> = ({
  currentApp = 'kruh',
  subAppSubtitle,
  user,
  onLogin,
  onLogout,
  currentLang = 'sl',
  onLanguageChange,
  extraNavItems,
  rightActionItems,
  className = '',
}) => {
  const [selectedLang, setSelectedLang] = useState<'sl' | 'en'>(currentLang);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (already installed) or saved in localStorage
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem(`kck_${currentApp}_pwa_installed`) === 'true' ||
      localStorage.getItem('kck_pwa_installed') === 'true'
    ) {
      setIsPwaInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsPwaInstalled(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`kck_${currentApp}_pwa_installed`, 'true');
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [currentApp]);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`kck_${currentApp}_pwa_installed`, 'true');
        }
      }
      setDeferredPrompt(null);
    } else {
      alert(
        selectedLang === 'sl'
          ? 'Za namestitev aplikacije na telefon izberite »Dodaj na začetni zaslon« v meniju brskalnika.'
          : 'To install this app on your device, tap "Add to Home Screen" in your browser menu.'
      );
    }
  };

  const handleToggleLang = (lang: 'sl' | 'en') => {
    setSelectedLang(lang);
    if (typeof document !== 'undefined') {
      const isKalvarija = window.location.hostname.includes('kalvarija.si');
      const domain = isKalvarija ? '; domain=.kalvarija.si' : '';
      document.cookie = `kck_lang=${lang}; path=/${domain}; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
    if (onLanguageChange) onLanguageChange(lang);
  };

  const meta = SUB_APP_METAS[currentApp];
  const displaySubtitle = subAppSubtitle || meta.subtitle;

  return (
    <header className={`sticky top-0 z-50 transition-all ${className}`}>
      {/* Tier 1: Thin Top Wine Utility Bar (matches kalvarija.si) */}
      <div className="bg-[#93032E] text-white text-xs px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between border-b border-black/10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          
          {/* Left: Sub-App Identity Subtitle */}
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 tracking-wider">
              {meta.title}
            </span>
            <span className="font-bold truncate text-xs sm:text-[13px] tracking-tight text-white/90">
              {displaySubtitle}
            </span>
          </div>

          {/* Right Utilities: Social Links, PWA Install, Live Stream, Language, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Working Social Channel Links */}
            <div className="flex items-center gap-1 sm:gap-1.5 border-r border-white/20 pr-2 sm:pr-3">
              <a
                href="https://www.youtube.com/@KCKalvarija"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="KCK YouTube kanal (@KCKalvarija)"
                aria-label="YouTube @KCKalvarija"
              >
                <Youtube className="w-3.5 h-3.5 text-rose-300 hover:text-white" />
              </a>
              <a
                href="https://www.facebook.com/kck.celje"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="KCK Facebook stran (@kck.celje)"
                aria-label="Facebook @kck.celje"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-200 hover:text-white" />
              </a>
              <a
                href="https://www.instagram.com/kalvarijacelje/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="KCK Instagram profil (@kalvarijacelje)"
                aria-label="Instagram @kalvarijacelje"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-200 hover:text-white" />
              </a>

              {/* Top Bar PWA Download Button - Auto-hides when installed */}
              {!isPwaInstalled && (
                <div className="relative group ml-1">
                  <button
                    onClick={handlePwaInstall}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-xs border border-amber-300/80 hover:scale-105"
                    title={selectedLang === 'sl' ? 'Namesti aplikacijo na začetni zaslon' : 'Install App'}
                    aria-label="Namesti aplikacijo"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                    <span className="hidden sm:inline">
                      {selectedLang === 'sl' ? 'Namesti APP' : 'Install App'}
                    </span>
                  </button>

                  {/* Mouseover Tooltip Hover Effect */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-xl shadow-2xl border border-white/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 transform translate-y-1 group-hover:translate-y-0">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedLang === 'sl' ? `Namesti ${meta.title} na telefon / PC` : `Install ${meta.title} App`}</span>
                    </div>
                    <div className="text-[9px] text-[#EBDDD6] font-normal text-center mt-0.5">
                      {selectedLang === 'sl' ? 'Hitrejši 1-klik dostop brez brskalnika' : 'Fast 1-click home screen access'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Stream / Church Main Link */}
            <a
              href="https://kalvarija.si"
              className="hidden md:flex items-center gap-1.5 text-white/90 hover:text-white font-bold transition-colors cursor-pointer"
              title="Portal cerkve Kalvarija Celje"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden xs:inline text-xs">V živo</span>
            </a>

            {/* Language Switcher (SL | EN) */}
            <div className="flex items-center bg-black/25 rounded-lg p-0.5 border border-white/20">
              <button
                onClick={() => handleToggleLang('sl')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === 'sl'
                    ? 'bg-white text-[#93032E] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Slovenski jezik"
              >
                SL
              </button>
              <button
                onClick={() => handleToggleLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === 'en'
                    ? 'bg-white text-[#93032E] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
                title="English language"
              >
                EN
              </button>
            </div>

            {/* User Account / Profile Badge */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition cursor-pointer border border-white/20 text-xs font-bold"
                  title={user.name}
                >
                  <div className="w-5 h-5 rounded-full bg-white text-[#93032E] font-black flex items-center justify-center text-[10px]">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[160px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#A6A15E]/20 p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2.5 border-b border-gray-100">
                      <div className="font-bold text-xs text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      {user.role && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#034C3C]/10 text-[#034C3C]">
                          {user.role}
                        </span>
                      )}
                    </div>
                    {onLogout && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Odjava</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : onLogin ? (
              <button
                onClick={onLogin}
                className="px-2.5 py-0.5 bg-white text-[#93032E] hover:bg-white/90 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Prijava
              </button>
            ) : null}

          </div>
        </div>
      </div>

      {/* Tier 2: Main Pure White Navbar (matches kalvarija.si) */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-[#A6A15E]/20 shadow-xs h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 xl:gap-4">
          
          {/* Left: Responsive Brand Logo with Sub-App Name in Bold Wine Red */}
          <BrandLogo
            variant="responsive"
            isLight={false}
            subAppTitle={currentApp !== 'main' ? meta.title : undefined}
          />

          {/* Center: Desktop Navigation Tabs */}
          {extraNavItems && (
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {extraNavItems}
            </div>
          )}

          {/* Right: 9-Dot Ecosystem Apps Dropdown + App Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {rightActionItems}
            <EcosystemAppsDropdown currentApp={currentApp} isLight={false} />
          </div>

        </div>
      </nav>
    </header>
  );
};
