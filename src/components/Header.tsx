'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Menu } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    { href: '/', label: translate('global.home', language) },
    {
      href: '/explore',
      label:
        language === 'hi' ? 'मानचित्र' : language === 'ta' ? 'வரைபடம்' : 'Explore',
    },
    {
      href: '/compare',
      label:
        language === 'hi' ? 'तुलना करें' : language === 'ta' ? 'ஒப்பிடு' : 'Compare',
    },
    { href: '/methodology', label: 'Methodology' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      {/* ── Slim meta bar ── */}
      <div
        style={{
          borderBottom: '1px solid var(--hairline)',
          fontSize: 'var(--type-xs)',
          color: 'var(--ink-3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.35rem',
            paddingBottom: '0.35rem',
            gap: '0.75rem',
          }}
        >
          <span>
            {language === 'hi'
              ? '12 निर्वाचन क्षेत्र · ₹300 करोड़ MPLAD'
              : language === 'ta'
              ? '12 தொகுதிகள் · ₹300 கோடி MPLAD'
              : '12 constituencies · ₹300 cr MPLAD monitored'}
          </span>
          <span className="hidden sm:inline">Updated 15 Jul 2026</span>
        </div>
      </div>

      {/* ── Main header row ── */}
      <div className="container" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Wordmark */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <Image src="/logo_icon.svg" alt="Know Your Leaders" width={28} height={28} priority />
            <div>
              <div className="logo">
                {translate('global.brand', language)}
              </div>
              <div
                style={{
                  fontSize: 'var(--type-xs)',
                  color: 'var(--ink-3)',
                  letterSpacing: '0.04em',
                  marginTop: '1px',
                }}
              >
                {translate('global.tagline', language)}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Language dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: 'var(--type-xs)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0.3rem 0.55rem',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--ink-3)',
                    cursor: 'pointer',
                    minHeight: 'var(--min-touch)',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                >
                  {language.toUpperCase()}
                  <ChevronDown style={{ width: '12px', height: '12px' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ minWidth: '10rem' }}>
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(
                  [
                    ['en', 'English'],
                    ['hi', 'हिन्दी'],
                    ['ta', 'தமிழ்'],
                  ] as const
                ).map(([code, label]) => (
                  <DropdownMenuItem
                    key={code}
                    onSelect={() => setLanguage(code as Language)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile nav hamburger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.35rem',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--ink-2)',
                    cursor: 'pointer',
                    minHeight: 'var(--min-touch)',
                    minWidth: 'var(--min-touch)',
                  }}
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu style={{ width: '16px', height: '16px' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ minWidth: '12rem' }}>
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
