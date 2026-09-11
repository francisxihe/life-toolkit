import { IsOptional, IsString } from 'class-validator';

export class BaseFilterDto {
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
