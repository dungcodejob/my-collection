import { BookmarkEntity } from "@common/entities";
import { provideUnitOfWork } from "@common/repositories";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CollectionModule } from "@modules/collection";
import { TagModule } from "@modules/tag";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BookmarkController } from "./bookmark.controller";
import { CommandHandlers } from "./commands";
import { QueriesHandlers } from "./queries";
import { BookmarkMapper, BookmarkService } from "./services";

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([BookmarkEntity]),
    CollectionModule,
    TagModule,
  ],
  providers: [
    ...CommandHandlers,
    ...QueriesHandlers,
    provideUnitOfWork(),
    BookmarkService,
    BookmarkMapper,
  ],
  exports: [BookmarkMapper, BookmarkService],
  controllers: [BookmarkController],
})
export class BookmarkModule {}
