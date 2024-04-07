import { BadRequestException } from "@nestjs/common";

export class Bookmark {
  static NotExist = new BadRequestException("Bookmark.NotExist");
}
