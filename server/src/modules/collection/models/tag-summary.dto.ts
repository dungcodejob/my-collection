import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO for tag summary in collection responses
 */
export class TagSummaryDto {
  @ApiProperty({ description: 'Tag ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Tag name', example: 'web_development' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Display name (capitalized)',
    example: 'Web development',
  })
  @Expose()
  displayName: string;

  @ApiPropertyOptional({
    description: 'Tag color in hex format',
    example: '#3B82F6',
  })
  @Expose()
  color?: string;
}
