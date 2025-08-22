import { BaseResponseDto } from "./base-response.dto";

export type ErrorResponseDto = {
  success: false;
  errorCode: string;
} & BaseResponseDto;

export type ValidatorErrorDto = {
  property: string;
  constraints?: { [key: string]: string };
};

export type ValidatorResponseDto = {
  readonly errorCode: "BadRequest";
  readonly result: Readonly<{ meta: { validators: ValidatorErrorDto[] } }>;
} & ErrorResponseDto;
