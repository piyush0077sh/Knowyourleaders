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
            <footer className="mt-auto border-t border-slate-200 bg-white py-8">
              <div className="container flex flex-col items-center gap-3 text-center text-sm text-slate-500 md:flex-row md:justify-between md:text-left">
                <p>© {new Date().getFullYear()} Know Your Leaders. Built for evidence-first public accountability.</p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:justify-end">
                  <span>Last updated: 15 Jul 2026</span>
                  <span className="text-slate-300">•</span>
                  <a href="https://smart-india-movement.vercel.app/" target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-slate-950">
                    Smart India Movement
                  </a>
                  <span className="text-slate-300">•</span>
                  <Link href="/methodology" className="font-medium text-slate-700 hover:text-slate-950">
                    Methodology
                  </Link>
                  <span className="text-slate-300">•</span>
                  <span>Official sources only: mplads.gov.in, ECI, Hansards, and audit records.</span>
                </div>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
