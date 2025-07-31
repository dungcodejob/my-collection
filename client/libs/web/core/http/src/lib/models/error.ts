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
    options?: {
      defaultMessage?: string;
    }
  ): MCApiError {
    return new MCApiError(
      res.message || options?.defaultMessage || DEFAULT_ERROR_MESSAGE,
      res,
      res.url
    );
  }

  is(error: unknown): error is MCApiError {
    if (error instanceof MCApiError && error.name === "MCApiError") {
      return true;
    }
    return false;
  }
}

export class MCClientError extends Error {
  constructor(
    override readonly message: string,
    readonly data: unknown = null
  ) {
    super(message);
    this.name = "MCClientError";
  }

  is(error: unknown): error is MCClientError {
    if (error instanceof MCClientError && error.name === "MCClientError") {
      return true;
    }
    return false;
  }
}
