import { PartialType } from '@nestjs/mapped-types';
import { CreateSubTodoDto } from './create-sub-todo.dto';

export class UpdateSubTodoDto extends PartialType(CreateSubTodoDto) {
  id: string;
} 