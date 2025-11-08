import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';

export class MetadataRequestDto {
  @ApiProperty({
    description: 'URL to fetch metadata from',
    example: 'https://example.com/article',
    maxLength: 2048,
  })
  @IsUrl({}, { message: 'URL must be a valid HTTP/HTTPS URL' })
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  url: string;
}

