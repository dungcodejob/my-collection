import {
  BooleanFieldOptional,
  EnumField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@app/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export enum BulkTagOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export class BulkTagOperationDto {
  @EnumField(() => BulkTagOperationType, {
    description: 'Type of bulk operation to perform',
    example: BulkTagOperationType.CREATE,
  })
  operation: BulkTagOperationType;

  @ApiProperty({
    description: 'Array of tag IDs to operate on',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}

export class BulkTagUpdateDto {
  @UUIDField({
    description: 'ID of the tag to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tagId: string;

  @StringFieldOptional({
    description: 'New name for the tags',
    example: 'updated-tag-name',
  })
  name?: string;

  @StringFieldOptional({
    description: 'New description for the tags',
    example: 'Updated description',
  })
  description?: string;

  @StringFieldOptional({
    description: 'New color for the tags in hex format',
    example: '#FF5733',
    isHexColor: true,
  })
  color?: string;

  @StringFieldOptional({
    description: 'New category for the tags',
    example: 'Updated Category',
  })
  category?: string;

  @BooleanFieldOptional({
    description: 'Whether the tags should be active',
    example: true,
  })
  isActive?: boolean;
}

export class BulkTagAssignDto {
  @ApiProperty({
    description: 'Array of bookmark IDs to assign tags to',
    example: [
      '123e4567-e89b-12d3-a456-426614174002',
      '123e4567-e89b-12d3-a456-426614174003',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  bookmarkIds: string[];

  @ApiProperty({
    description: 'Array of tag IDs to assign',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}

export class BulkTagOperationResponseDto {
  @StringField({
    description: 'Status of the bulk operation',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Number of tags successfully processed',
    example: 5,
  })
  processedCount: number;

  @ApiProperty({
    description: 'Number of tags that failed to process',
    example: 1,
  })
  failedCount: number;

  @ApiProperty({
    description: 'Array of error messages for failed operations',
    example: ['Tag with ID 123 not found'],
    type: [String],
    required: false,
  })
  errors?: string[];

  @ApiProperty({
    description: 'Array of successfully processed tag IDs',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
    required: false,
  })
  processedTagIds?: string[];
}
