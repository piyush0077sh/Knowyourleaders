import type { Metadata } from 'next';
import { Inter, Outfit, Newsreader, JetBrains_Mono } from 'next/font/google';
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
  title: 'Know Your Leaders - Smart India Movement',
  description: 'Uncovering constituency project progress, budgets, and politician performance metrics. Empowering citizens through data transparency.',
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
            <footer className="py-8 border-t border-slate-200 mt-auto bg-white">
              <div className="container text-center text-sm text-slate-500">
                <p>© {new Date().getFullYear()} Know Your Leaders. Empowering Indian citizens through open data transparency.</p>
                <p className="mt-1 text-xs">All information sourced from official government portals (mplads.gov.in) and public records.</p>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
