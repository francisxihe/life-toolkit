import { z } from 'zod';

export const todaySectionKindSchema = z.enum(['metric', 'list', 'timer']);

export type TodaySectionKind = z.infer<typeof todaySectionKindSchema>;

export const todaySectionDescriptorSchema = z.object({
  kind: todaySectionKindSchema,
  titleKey: z.string().min(1),
  order: z.number().optional(),
  unit: z.string().optional(),
});

export type TodaySectionDescriptor = z.infer<typeof todaySectionDescriptorSchema>;

export const todayCommandSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  path: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
});

export type TodayCommand = z.infer<typeof todayCommandSchema>;

export const todayListItemActionSchema = z.object({
  id: z.string().min(1),
  labelKey: z.string().min(1),
  disabled: z.boolean().optional(),
  command: todayCommandSchema.optional(),
  hostAction: z.string().min(1).optional(),
});

export type TodayListItemAction = z.infer<typeof todayListItemActionSchema>;

export const todayListItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().optional(),
  overdue: z.boolean().optional(),
  pluginId: z.string().min(1).optional(),
  entityType: z.string().min(1).optional(),
  actions: z.array(todayListItemActionSchema).optional(),
  meta: z.record(z.unknown()).optional(),
});

export type TodayListItem = z.infer<typeof todayListItemSchema>;

export const todaySectionSnapshotSchema = z.object({
  id: z.string().min(1),
  kind: todaySectionKindSchema,
  titleKey: z.string().min(1),
  order: z.number().optional(),
  value: z.number().optional(),
  unit: z.string().optional(),
  items: z.array(todayListItemSchema).optional(),
  timer: z
    .object({
      id: z.string().min(1),
      label: z.string().optional(),
      startedAt: z.string().min(1),
      hostAction: z.string().min(1).optional(),
    })
    .optional(),
});

export type TodaySectionSnapshot = z.infer<typeof todaySectionSnapshotSchema>;

export function mergeTodaySections(parts: TodaySectionSnapshot[][]): TodaySectionSnapshot[] {
  const merged = parts.flat();
  return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
}
