import type { Metadata } from 'next';
import { Inter, Outfit, Newsreader, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Know Your Leaders',
  description: 'A civic audit platform for constituency records, evidence-linked promises, and MPLAD transparency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${newsreader.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pb-16">{children}</main>
            <footer style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface)', padding: '2rem 0' }}>
              <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem 2rem' }}>
                  <span style={{ fontSize: 'var(--type-sm)', color: 'var(--ink-3)' }}>
                    © {new Date().getFullYear()} Know Your Leaders
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1.25rem', fontSize: 'var(--type-sm)', color: 'var(--ink-3)' }}>
                    <a href="https://smart-india-movement.vercel.app/" target="_blank" rel="noreferrer">Smart India Movement</a>
                    <Link href="/methodology">Methodology</Link>
                    <a href="https://mplads.gov.in" target="_blank" rel="noreferrer">mplads.gov.in</a>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--type-xs)', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                  All data sourced from official government portals: MPLADS, ECI, Parliamentary Hansards, and audit records. Last updated: 15 Jul 2026.
                </p>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
