import { TagEntity } from "@common/entities";
import { provideUnitOfWork } from "@common/repositories";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CommandHandlers } from "./commands";
import { QueriesHandlers } from "./queries";
import { TagMapper, TagService } from "./services";
import { TagController } from "./tag.controller";

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([TagEntity])],
  providers: [
    ...CommandHandlers,
    ...QueriesHandlers,
    provideUnitOfWork(),
    TagService,
    TagMapper,
  ],
  exports: [TagMapper, TagService],
  controllers: [TagController],
})
export class TagModule {}
