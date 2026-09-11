import { useSearchParams } from 'react-router-dom';
import type { GrowthArea, GrowthTab } from '../../contract';

const AREAS: GrowthArea[] = ['todo', 'task', 'habit', 'goal'];

export function parseGrowthArea(value: string | null): GrowthArea {
  return AREAS.includes(value as GrowthArea) ? (value as GrowthArea) : 'todo';
}

export function parseGrowthTab(area: GrowthArea, tab: string | null, id?: string | null): GrowthTab {
  if (area === 'habit') {
    if (tab === 'list') return 'list';
    if (tab === 'detail' || id) return 'detail';
    return 'list';
  }
  if (tab === 'calendar' || tab === 'all' || tab === 'today') return tab;
  return 'today';
}

export function useGrowthView() {
  const [params] = useSearchParams();
  const area = parseGrowthArea(params.get('area'));
  const id = params.get('id') || undefined;
  const goalId = params.get('goalId') || undefined;
  const tab = parseGrowthTab(area, params.get('tab'), id);
  return { area, tab, id, goalId };
}
