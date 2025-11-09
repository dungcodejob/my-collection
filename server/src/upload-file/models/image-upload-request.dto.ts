import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * T109: ImageUploadRequestDto
 * Request DTO for generating presigned URL for image upload
 */
export class ImageUploadRequestDto {
  @ApiProperty({
    description: 'Original filename of the image',
    example: 'my-bookmark-image.jpg',
    maxLength: 255,
  })
  @IsString({ message: 'Filename must be a string' })
  @MaxLength(255, { message: 'Filename cannot exceed 255 characters' })
  filename: string;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  })
  @IsString({ message: 'MIME type must be a string' })
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'], {
    message:
      'MIME type must be one of: image/jpeg, image/jpg, image/png, image/gif, image/webp',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes (max 5MB)',
    example: 1048576,
    minimum: 1,
    maximum: 5242880,
  })
  @IsInt({ message: 'Size must be an integer' })
  @Min(1, { message: 'Size must be at least 1 byte' })
  @Max(5242880, { message: 'Size cannot exceed 5MB (5242880 bytes)' })
  size: number;
}
