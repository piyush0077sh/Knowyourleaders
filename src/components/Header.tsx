'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    { href: '/explore', label: language === 'hi' ? 'मानचित्र अन्वेषण' : language === 'ta' ? 'வரைபட अन्वेषण' : 'Explore Map' },
    { href: '/compare', label: language === 'hi' ? 'सांसदों की तुलना' : language === 'ta' ? 'எம்.பி.க்களை ஒப்பிடுக' : 'Compare MPs' },
    { href: '/methodology', label: 'Methodology' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="border-b border-slate-100 bg-slate-50 text-slate-600">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-2 text-[11px] uppercase tracking-[0.16em]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
              Editorial evidence desk
            </Badge>
            <span>{language === 'hi' ? '12 निर्वाचन क्षेत्र ट्रैक किए गए' : language === 'ta' ? '12 தொகுதிகள் கண்காணிக்கப்பட்டன' : '12 constituencies tracked'}</span>
            <span className="text-slate-400">•</span>
            <span>₹300 crore MPLAD monitored</span>
          </div>
          <span className="hidden text-slate-500 sm:inline">Last updated: 15 Jul 2026</span>
        </div>
      </div>

      <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image src="/logo_icon.svg" alt="Know Your Leaders" width={36} height={36} priority />
            <div>
              <div className="font-display text-lg font-semibold uppercase tracking-[0.18em] text-slate-950">
                {translate('global.brand', language)}
              </div>
              <div className="text-xs text-slate-500">{translate('global.tagline', language)}</div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Smart India Movement initiative
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant={isActive(item.href) ? 'secondary' : 'ghost'} size="sm">
              <Link href={item.href}>
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                {language.toUpperCase()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {([
                ['en', 'English'],
                ['hi', 'हिन्दी'],
                ['ta', 'தமிழ்'],
              ] as const).map(([code, label]) => (
                <DropdownMenuItem key={code} onSelect={() => setLanguage(code as Language)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
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
    </header>
  );
}
