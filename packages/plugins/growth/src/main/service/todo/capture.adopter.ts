import dayjs from 'dayjs';
import type { CaptureAdopter } from '@true-north/plugin-sdk';
import { TodoStatus } from '@true-north/enum';
import { CreateTodoDto } from './dto';
import { todoService } from './todo.service';

export const todoCaptureAdopter: CaptureAdopter = {
  type: 'growth.todo',
  async adopt(suggestion) {
    const payload = suggestion.payload || {};
    const dto = new CreateTodoDto();
    dto.importCreateVo({
      name: String(payload.title || ''),
      description: payload.note ? String(payload.note) : undefined,
      planDate: String(payload.planned || dayjs().format('YYYY-MM-DD')),
      status: TodoStatus.TODO,
    });
    const todo = await todoService.create(dto, {
      skipActivity: true,
    });
    return {
      pluginId: 'growth',
      entityType: 'todo',
      entityId: todo.id,
      role: 'todo',
      label: todo.name,
    };
  },
};
