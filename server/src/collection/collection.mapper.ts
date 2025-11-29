import { CollectionEntity, TagEntity } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  CollectionDto,
  CollectionTreeResponseDto,
  TagSummaryDto,
} from './models';

@Injectable()
export class CollectionMapper {
  /**
   * Convert CollectionEntity to CollectionResponseDto
   */
  toResponseDto(entity: CollectionEntity, tags?: TagEntity[]): CollectionDto {
    const dto = plainToInstance(CollectionDto, entity, {
      excludeExtraneousValues: true,
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      dto.tags = tags.map((tag) => this.toTagSummary(tag));
    } else if (entity.collectionTags?.isInitialized()) {
      dto.tags = entity.collectionTags
        .getItems()
        .map((ct) => this.toTagSummary(ct.tag));
    }

    return dto;
  }

  /**
   * Convert TagEntity to TagSummaryDto
   */
  toTagSummary(tag: TagEntity): TagSummaryDto {
    return {
      id: tag.id,
      name: tag.name,
      displayName: tag.getDisplayName(),
      color: tag.color,
    };
  }

  /**
   * Convert CollectionEntity to CollectionTreeResponseDto with children
   */
  toTreeResponseDto(entity: CollectionEntity): CollectionTreeResponseDto {
    const baseDto = this.toResponseDto(entity);

    return {
      ...baseDto,
      children: entity.children?.isInitialized()
        ? entity.children
            .getItems()
            .map((child) => this.toTreeResponseDto(child))
        : [],
    };
  }

  /**
   * Convert multiple CollectionEntity to CollectionResponseDto array
   */
  toResponseDtoArray(entities: CollectionEntity[]): CollectionDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }

  /**
   * Convert multiple CollectionEntity to CollectionTreeResponseDto array
   */
  toTreeResponseDtoArray(
    entities: CollectionEntity[],
  ): CollectionTreeResponseDto[] {
    return entities.map((entity) => this.toTreeResponseDto(entity));
  }

  /**
   * Convert CollectionEntity to a simple object for internal use
   */
  toSimpleObject(entity: CollectionEntity): {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    isHasChild: boolean;
  } {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path,
      parentId: entity.parent?.id,
      isHasChild: entity.isHasChild,
    };
  }

  /**
   * Convert CollectionEntity to breadcrumb format
   */
  toBreadcrumb(entity: CollectionEntity): {
    id: string;
    name: string;
    path: string;
  } {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path,
    };
  }

  /**
   * Generate breadcrumb trail from collection path
   */
  generateBreadcrumbTrail(
    entity: CollectionEntity,
    allCollections: CollectionEntity[],
  ): Array<{ id: string; name: string; path: string }> {
    const breadcrumbs: Array<{ id: string; name: string; path: string }> = [];

    if (!entity.parent) {
      return [this.toBreadcrumb(entity)];
    }

    // Split the parent path to get all parent names
    const pathParts = entity.parent.path.split('/');
    let currentPath = '';

    // Build breadcrumbs for each level
    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Find the collection with this path
      const collection = allCollections.find((c) => c.path === currentPath);
      if (collection) {
        breadcrumbs.push(this.toBreadcrumb(collection));
      } else {
        // Fallback if collection not found
        breadcrumbs.push({
          id: '',
          name: part,
          path: currentPath,
        });
      }
    }

    // Add current collection
    breadcrumbs.push(this.toBreadcrumb(entity));

    return breadcrumbs;
  }

  /**
   * Convert entity to search result format
   */
  toSearchResult(entity: CollectionEntity): {
    id: string;
    name: string;
    path: string;
    parentPath?: string;
    icon?: string;
    description?: string;
    matchType: 'name' | 'path' | 'description';
  } {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path,
      parentPath: entity.parent?.path,
      icon: entity.icon,
      description: entity.description,
      matchType: 'name', // This would be determined by search logic
    };
  }

  /**
   * Convert entity to minimal format for dropdown/select options
   */
  toSelectOption(entity: CollectionEntity): {
    value: string;
    label: string;
    path: string;
    disabled?: boolean;
  } {
    return {
      value: entity.id,
      label: entity.name,
      path: entity.path,
      disabled: !entity.isActive,
    };
  }

  /**
   * Convert entities to hierarchical select options
   */
  toHierarchicalSelectOptions(
    entities: CollectionEntity[],
    level: number = 0,
  ): Array<{
    value: string;
    label: string;
    path: string;
    level: number;
    disabled?: boolean;
  }> {
    const options: Array<{
      value: string;
      label: string;
      path: string;
      level: number;
      disabled?: boolean;
    }> = [];

    for (const entity of entities) {
      options.push({
        value: entity.id,
        label: entity.name,
        path: entity.path,
        level,
        disabled: !entity.isActive,
      });

      // Add children recursively
      if (entity.children?.isInitialized() && entity.children.length > 0) {
        const childOptions = this.toHierarchicalSelectOptions(
          entity.children.getItems(),
          level + 1,
        );
        options.push(...childOptions);
      }
    }

    return options;
  }

  /**
   * Convert entity to export format
   */
  toExportFormat(entity: CollectionEntity): {
    id: string;
    name: string;
    icon?: string;
    parentId?: string;
    parentPath?: string;
    path: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      parentId: entity.parent?.id,
      parentPath: entity.parent?.path,
      path: entity.path,
      description: entity.description,
      sortOrder: entity.sortOrder,
      isActive: entity.isActive,
      createdAt: entity.createAt || new Date(),
      updatedAt: entity.updateAt || new Date(),
    };
  }
}
