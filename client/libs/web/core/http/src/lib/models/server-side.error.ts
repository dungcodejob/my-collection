import { DEFAULT_ERROR_MESSAGE } from "@client/web-shared-constants";
import { ErrorResponseDto } from "./response.dto";

export class MCApiError extends Error {
  private constructor(
    override readonly message: string,
    readonly data: unknown = null,
    readonly route?: string
  ) {
    super(message);
    this.name = "MCApiError";
  }

  static fromResponse(
    res: ErrorResponseDto,
    options: {
      defaultMessage?: string;
    }
  ): MCApiError {
    return new MCApiError(
      res.message || options.defaultMessage || DEFAULT_ERROR_MESSAGE,
      res,
      res.url
    );
  }
}
