import { BooleanField, NumberField } from '@app/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { TagResponseDto } from './tag-response.dto';

export class TagWithPaginationResponseDto {
  @ApiProperty({
    description: 'List of tags',
    type: [TagResponseDto],
  })
  tags: TagResponseDto[];

  @NumberField({
    description: 'Total number of tags',
    example: 50,
    int: true,
    min: 0,
  })
  total: number;

  @NumberField({
    description: 'Current offset',
    example: 0,
    int: true,
    min: 0,
  })
  offset: number;

  @NumberField({
    description: 'Number of items per page',
    example: 20,
    int: true,
    min: 1,
  })
  limit: number;

  @BooleanField({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore: boolean;
}
