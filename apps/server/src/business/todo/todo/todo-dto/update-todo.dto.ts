import { PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({ description: '待办事项ID' })
  id: string;
} 