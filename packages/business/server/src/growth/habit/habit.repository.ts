import { Habit } from './habit.entity';
import { HabitFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface HabitRepository extends BaseRepository<Habit, HabitFilterDto> {}
