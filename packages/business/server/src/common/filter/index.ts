export * from './page.dto';
import { IsOptional, IsString, IsArray, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class BaseFilterDto {
  /** 搜索关键词 */
  @IsString()
  @IsOptional()
  keyword?: string;
  excludeIds?: string[];
  includeIds?: string[];
}

export function importBaseVo(baseFilterVo: BaseFilterDto, baseFilterDto: BaseFilterDto) {
  baseFilterDto.keyword = baseFilterVo.keyword;
  baseFilterDto.excludeIds = baseFilterVo.excludeIds;
  baseFilterDto.includeIds = baseFilterVo.includeIds;
}