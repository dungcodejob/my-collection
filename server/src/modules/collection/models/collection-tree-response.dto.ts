import { ApiProperty } from '@nestjs/swagger';
import { CollectionDto } from './collection.dto';

/**
 * DTO for collection tree response (includes children)
 */
export class CollectionTreeResponseDto extends CollectionDto {
  @ApiProperty({
    description: 'Child collections',
    type: [CollectionTreeResponseDto],
    required: false,
  })
  children?: CollectionTreeResponseDto[];
}
