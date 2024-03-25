import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationParameterDto {
  @IsOptional()
  @IsInt({ message: 'Current page must be an integer' })
  @Min(1, { message: 'Current page must be greater than or equal to 1' })
  @Type(() => Number)
  readonly currentPage = 1;

  @IsOptional()
  @IsInt({ message: 'Page size must be an integer' })
  @Min(1, { message: 'Page size must be greater than or equal to 1' })
  @Max(100, { message: 'Page size must be less than or equal to 100' })
  @Type(() => Number)
  readonly pageSize = 10;
}
