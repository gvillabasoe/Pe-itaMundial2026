import 'server-only';

import demoData from '@/data/demo-data.json';
import type { DemoData } from '@/lib/types';

let cachedData: DemoData | null = null;

export function getDemoData(): DemoData {
  if (!cachedData) {
    cachedData = demoData as DemoData;
  }
  return cachedData;
}
