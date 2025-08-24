import { ResponseKey } from "@common/constants";
import { SetMetadata } from "@nestjs/common";

export const ResponseMessage = (message: string) =>
  SetMetadata(ResponseKey.Message, message);
