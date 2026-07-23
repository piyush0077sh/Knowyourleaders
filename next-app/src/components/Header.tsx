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
  );
}
