'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cx } from '@/lib/formatting';

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner app-container">
        <Link className="site-brand" href="/" aria-label={APP_NAME}>
          <img src="/logo.svg" alt="" className="site-brand__logo" />
          <div className="site-brand__copy">
            <strong>{APP_NAME}</strong>
            <span>IV Edición</span>
          </div>
        </Link>

        <nav className="site-nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cx('site-nav__link', isActive && 'is-active')}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
