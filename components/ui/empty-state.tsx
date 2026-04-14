import type { ReactNode } from 'react';

import { cx } from '@/lib/formatting';

export function EmptyState({
  title,
  text,
  compact = false,
  action,
}: {
  title: string;
  text?: string;
  compact?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={cx('empty-state', compact && 'empty-state--compact')}>
      <span className="empty-state__kicker">Pendiente</span>
      <strong className="empty-state__title">{title}</strong>
      {text ? <p className="empty-state__text">{text}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
