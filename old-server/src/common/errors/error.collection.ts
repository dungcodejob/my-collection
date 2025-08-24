import { BadRequestException } from "@nestjs/common";

export class Collection {
  static NotExist = new BadRequestException("Collection.NotExist");
}
