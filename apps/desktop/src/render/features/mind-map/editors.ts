import type { ComponentType } from 'react';

export type GoalMindMapEditors = {
  GoalEditor: ComponentType<{ goalId: string; onClose: () => void | Promise<void>; afterSubmit: () => void | Promise<void> }>;
  GoalCreator: ComponentType<{
    initialFormData?: Record<string, unknown>;
    onClose: () => void | Promise<void>;
    afterSubmit: () => void | Promise<void>;
  }>;
};

let editors: GoalMindMapEditors | null = null;

export function registerGoalMindMapEditors(next: GoalMindMapEditors | null) {
  editors = next;
}

export function getGoalMindMapEditors(): GoalMindMapEditors | null {
  return editors;
}
