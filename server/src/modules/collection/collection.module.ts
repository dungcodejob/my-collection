import { CollectionEntity } from "@common/entities";
import { provideUnitOfWork } from "@common/repositories";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CollectionController } from "./collection.controller";
import { CommandHandlers } from "./commands";
import { QueriesHandlers } from "./queries";
import {
  CollectionMapper,
  CollectionPositionService,
  CollectionService,
} from "./services";

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([CollectionEntity])],
  providers: [
    ...CommandHandlers,
    ...QueriesHandlers,
    provideUnitOfWork(),
    CollectionService,
    CollectionMapper,
    CollectionPositionService,
  ],
  exports: [CollectionService, CollectionMapper],
  controllers: [CollectionController],
})
export class CollectionModule {}
