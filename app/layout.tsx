import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteNav } from '@/components/layout/site-nav';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} · ${APP_SUBTITLE}`,
  description: 'Dashboard premium de porra del Mundial con clasificación, resultados, Mi Club y Versus.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteNav />
        <main className="app-container app-main">{children}</main>
      </body>
    </html>
  );
}
