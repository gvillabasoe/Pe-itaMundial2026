import type { ReactNode } from 'react';

import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import { cx } from '@/lib/formatting';

export function PageHero({
  title,
  subtitle,
  accent = 'neutral',
  children,
}: {
  title: string;
  subtitle: string;
  accent?: 'neutral' | 'ranking' | 'participant' | 'versus';
  children?: ReactNode;
}) {
  return (
    <section className={cx('page-hero', `page-hero--${accent}`)}>
      <div className="page-hero__copy">
        <span className="page-hero__eyebrow">
          {APP_NAME} · {APP_SUBTITLE}
        </span>
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__subtitle">{subtitle}</p>
        {children ? <div className="page-hero__meta">{children}</div> : null}
      </div>
      <img src="/logo.svg" alt="" className="page-hero__logo" />
    </section>
  );
}
