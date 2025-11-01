import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '@app/constants';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { QueryDto } from './query';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: DEFAULT_CURRENT_PAGE,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly currentPage: number = DEFAULT_CURRENT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly pageSize: number = DEFAULT_PAGE_SIZE;
}

export class PaginationQueryDto extends QueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: DEFAULT_CURRENT_PAGE,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly currentPage: number = DEFAULT_CURRENT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly pageSize: number = DEFAULT_PAGE_SIZE;
}
