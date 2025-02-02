import { TodoStatus, TodoStatusMeta } from "../../entities/base.entity";
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
} from "class-validator";
import { PageDto } from "@/base/page.dto";
import { ApiProperty } from "@nestjs/swagger";

export class TodoPageFilterDto extends PageDto {
  @ApiProperty({ 
    description: '搜索关键词',
    required: false 
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ 
    description: '计划开始日期',
    required: false,
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  planDateStart?: string;

  @ApiProperty({ 
    description: '计划结束日期',
    required: false,
    example: '2024-01-31'
  })
  @IsOptional()
  @IsDateString()
  planDateEnd?: string;

  @ApiProperty({ 
    description: '重要程度',
    required: false,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber()
  importance?: number;

  @ApiProperty({ 
    description: '紧急程度',
    required: false,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber()
  urgency?: number;

  @ApiProperty({ ...TodoStatusMeta, required: false })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiProperty({ 
    description: '完成开始日期',
    required: false,
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  doneDateStart?: string;

  @ApiProperty({ 
    description: '完成结束日期',
    required: false,
    example: '2024-01-31'
  })
  @IsOptional()
  @IsDateString()
  doneDateEnd?: string;

  @ApiProperty({ 
    description: '放弃开始日期',
    required: false,
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  abandonedDateStart?: string;

  @ApiProperty({ 
    description: '放弃结束日期',
    required: false,
    example: '2024-01-31'
  })
  @IsOptional()
  @IsDateString()
  abandonedDateEnd?: string;

  @ApiProperty({ 
    description: '页码',
    required: false,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  pageNum?: number | undefined;

  @ApiProperty({ 
    description: '每页数量',
    required: false,
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  pageSize?: number | undefined;
}
