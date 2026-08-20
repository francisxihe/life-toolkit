import { goalDeleteBlocker, taskDeleteBlocker, taskRootSubtree, validateGoalHierarchy, validateTaskHierarchy } from '../lifecycle';
import type { Goal, Habit, Task, Todo } from '../types';

const rootGoal: Goal = { id: 'g1', title: '年度目标', description: '', type: 'vision', status: 'doing', importance: 5, difficulty: 5, start: '2026-01-01', end: '2026-12-31', history: [] };
const childGoal: Goal = { id: 'g2', title: '子目标', description: '', parentId: 'g1', type: 'result', status: 'todo', importance: 4, difficulty: 4, start: '2026-03-01', end: '2026-09-30', history: [] };
const rootTask: Task = { id: 't1', title: '父任务', description: '', goalId: 'g1', status: 'doing', importance: 5, difficulty: 5, plannedStart: '2026-03-01', plannedEnd: '2026-03-02', start: '2026-03-01', end: '2026-09-30', estimated: 2, actual: 0 };

describe('growth lifecycle constraints', () => {
  it('rejects shrinking a goal around an existing child', () => {
    expect(validateGoalHierarchy({ ...rootGoal, end: '2026-06-30' }, [rootGoal, childGoal]))
      .toBe('调整目标时间前，请先处理超出范围的子目标');
  });

  it('rejects a child task that exceeds its parent constraints', () => {
    const invalidChild: Task = { ...rootTask, id: 't2', title: '子任务', goalId: undefined, parentId: 't1', importance: 6 };
    expect(validateTaskHierarchy(invalidChild, [rootGoal], [rootTask])).toBe('任务的时间、重要度和难度不能超出关联上游');
  });

  it('reports linked content before allowing deletion', () => {
    const todo = { id: 'd1', title: '待办', description: '', goalId: 'g1', status: 'todo', importance: 1, urgency: 1, planned: '2026-03-01', plannedStartTime: '09:00', plannedEndTime: '09:00', history: [] } satisfies Todo;
    const habit = { id: 'h1', title: '习惯', goalIds: ['g1'], status: 'active', importance: 1, difficulty: 1, repeat: {} as Habit['repeat'], streak: 0, longest: 0, logs: [] } satisfies Habit;
    expect(goalDeleteBlocker('g1', [rootGoal, childGoal], [rootTask], [todo], [habit]))
      .toContain('1 个子目标');
    expect(taskDeleteBlocker('t1', [rootTask, { ...rootTask, id: 't2', parentId: 't1', goalId: undefined }], [])).toContain('1 个子任务');
  });

  it('returns only the current root task and its descendants', () => {
    const childTask: Task = { ...rootTask, id: 't2', title: '子任务', goalId: undefined, parentId: 't1' };
    const standaloneTask: Task = { ...rootTask, id: 't3', title: '独立任务' };
    expect(taskRootSubtree('t2', [rootTask, childTask, standaloneTask]).map((task) => task.id)).toEqual(['t1', 't2']);
    expect(taskRootSubtree('t1', [rootTask, childTask, standaloneTask]).map((task) => task.id)).toEqual(['t1', 't2']);
    expect(taskRootSubtree('t3', [rootTask, childTask, standaloneTask]).map((task) => task.id)).toEqual(['t3']);
  });
});
