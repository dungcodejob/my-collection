import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto<T = string> {
  @ApiPropertyOptional({
    type: String,
    description: 'Search keyword',
  })
  keyword?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Search field',
  })
  field: T;
}
