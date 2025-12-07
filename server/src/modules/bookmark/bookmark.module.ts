import { TagModule } from '@app/tag';
import { Module } from '@nestjs/common';
import { CollectionModule } from '../collection/collection.module';
import { BookmarkController } from './bookmark.controller';
import { BookmarkMapper } from './bookmark.mapper';
import { BookmarkService } from './bookmark.service';

/**
 * T117: Register FileUploadService in bookmark module
 */
@Module({
  imports: [CollectionModule, TagModule],
  controllers: [BookmarkController],
  providers: [BookmarkService, BookmarkMapper],
  exports: [BookmarkService, BookmarkMapper],
})
export class BookmarkModule {}
