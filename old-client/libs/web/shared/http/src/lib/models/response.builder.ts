import { Builder } from "@nx/web-shared-models";
import { ResponseDto, SuccessResponseDto } from "./response.dto";
import { faker } from "@faker-js/faker/.";
import { map, mergeMap, throwError, timer } from "rxjs";

export class ResponseBuilder extends Builder<ResponseDto> {
  buildSuccess<T>(result?: T, duration: number = 500) {
    const value = this.with("success", true)
      .with("result" as any, result)
      .build() as SuccessResponseDto<T>;

    return timer(duration).pipe(map(() => value));
  }

  buildFailed(duration: number = 500) {
    const value = this.with("success", false) as ResponseBuilder;
    return timer(duration).pipe(mergeMap(() => throwError(() => value)));
  }

  override setDefaults(): Partial<ResponseDto> {
    return {
      statusCode: faker.internet.httpStatusCode(),
      message: faker.string.symbol(),
      description: faker.string.symbol(),
      timestamp: new Date().toString(),
      url: faker.internet.url(),
      method: faker.internet.httpMethod(),
    };
  }
}
