import { formatTodoPlan, groupExecutionItems } from '../utils';

describe('todo plan formatting', () => {
  it('formats equal start and end times as a point in time', () => {
    expect(formatTodoPlan({ planned: '2026-07-30', plannedStartTime: '09:00', plannedEndTime: '09:00' }))
      .toBe('2026-07-30 09:00');
  });

  it('formats differing start and end times as a range', () => {
    expect(formatTodoPlan({ planned: '2026-07-30', plannedStartTime: '09:00', plannedEndTime: '10:00' }))
      .toBe('2026-07-30 09:00-10:00');
  });
});

describe('groupExecutionItems includeOverdue', () => {
  const items = [
    { id: 'overdue', status: 'todo', plannedStart: '2026-07-20', plannedEnd: '2026-07-25' },
    { id: 'current', status: 'todo', plannedStart: '2026-07-27', plannedEnd: '2026-07-27' },
  ];

  it('includes overdue items by default', () => {
    const groups = groupExecutionItems(items, 'today', '2026-07-27', (item) => ({
      start: item.plannedStart,
      end: item.plannedEnd,
    }));
    expect(groups.find((group) => group.key === 'overdue')?.items.map((item) => item.id)).toEqual(['overdue']);
  });

  it('omits overdue items when includeOverdue is false', () => {
    const groups = groupExecutionItems(
      items,
      'today',
      '2026-07-27',
      (item) => ({ start: item.plannedStart, end: item.plannedEnd }),
      { includeOverdue: false },
    );
    expect(groups.find((group) => group.key === 'overdue')?.items).toEqual([]);
    expect(groups.find((group) => group.key === 'current')?.items.map((item) => item.id)).toEqual(['current']);
  });
});
