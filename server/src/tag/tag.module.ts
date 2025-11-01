import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagMapper } from './tag.mapper';

@Module({
  controllers: [TagController],
  providers: [TagService, TagMapper],
  exports: [TagService, TagMapper],
})
export class TagModule {}
