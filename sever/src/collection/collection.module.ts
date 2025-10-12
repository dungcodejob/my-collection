import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionMapper } from './collection.mapper';
import { CollectionService } from './collection.service';

@Module({
  imports: [],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionMapper],
  exports: [CollectionService, CollectionMapper],
})
export class CollectionModule {}
