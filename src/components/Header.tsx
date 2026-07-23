'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveCls = (path: string) => {
    if (path === '/' && pathname === '/') return 'nav-link active';
    if (path !== '/' && pathname.startsWith(path)) return 'nav-link active';
    return 'nav-link';
  };

  const exploreLabel = language === 'hi' ? 'मानचित्र अन्वेषण' : language === 'ta' ? 'வரைபடத்தை ஆராயுங்கள்' : 'Explore Map';
  const compareLabel = language === 'hi' ? 'सांसदों की तुलना' : language === 'ta' ? 'எம்.பி.க்களை ஒப்பிடுக' : 'Compare MPs';

  return (
    <>
      {/* ── Top Telemetry Ticker Bar ────────────────────────── */}
      <div className="bg-slate-950 text-slate-400 py-1 px-4 text-[11px] font-mono border-b border-slate-800/80 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {language === 'hi' ? 'लाइव ऑडिट नेटवर्क' : language === 'ta' ? 'நேரடி தணிக்கை பிணையம்' : 'LIVE CIVIC AUDIT'}
          </span>
          <span className="text-slate-600">|</span>
          <span>{language === 'hi' ? '12 संसदीय क्षेत्र ट्रैक किए गए' : language === 'ta' ? '12 தொகுதிகள் கண்காணிக்கப்பட்டது' : '12 CONSTITUENCIES TRACKED'}</span>
          <span className="text-slate-600">|</span>
          <span>{language === 'hi' ? '₹300 करोड़ MPLAD निधि की निगरानी' : language === 'ta' ? '₹300 கோடி MPLAD நிதி கண்காணிப்பு' : '₹300.0 CR MPLAD FUNDS AUDITED'}</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-500">
          <span>ECI AUDIT TIER: 100% VERIFIED</span>
          <span className="text-slate-700">•</span>
          <span>v2.0 NEXT.JS</span>
        </div>
      </div>

      <header className="topbar" style={{ position: 'relative' }}>
        <div className="container brand-row">
        <div>
          <Link href="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image
              src="/logo_icon.svg"
              alt="KnowYourLeaders"
              width={38}
              height={38}
              style={{ flexShrink: 0 }}
              priority
            />
            <div>
              <h1 className="logo">{translate('global.brand', language)}</h1>
              <p className="tagline">{translate('global.tagline', language)}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
          <nav className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
            <Link href="/" className={getActiveCls('/')} onClick={() => setMobileOpen(false)}>
              {translate('global.home', language)}
            </Link>
            <Link href="/explore" className={getActiveCls('/explore')} onClick={() => setMobileOpen(false)}>
              {exploreLabel}
            </Link>
            <Link href="/compare" className={getActiveCls('/compare')} onClick={() => setMobileOpen(false)}>
              {compareLabel}
            </Link>
          </nav>

          <div className="lang-switcher">
            <button
              onClick={() => setLanguage('en')}
              className={`lang-pill lang-btn ${language === 'en' ? 'active' : ''}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`lang-pill lang-btn ${language === 'hi' ? 'active' : ''}`}
              aria-label="Switch to Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`lang-pill lang-btn ${language === 'ta' ? 'active' : ''}`}
              aria-label="Switch to Tamil"
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
