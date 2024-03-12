import { ResponseDto } from "./response.dto";

export class ServerSideError extends Error {
  static create(res: ResponseDto) {
    return new ServerSideError(res.message);
  }
}
