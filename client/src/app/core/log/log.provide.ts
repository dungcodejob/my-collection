import { inject, InjectionToken, Provider, Type } from "@angular/core";
import { LoggingDestination } from "./destination/logging.destination";
import { LoggingFormatter } from "./formatter/logging.formatter";

export const FormatterToken = new InjectionToken("logging formatter token");

export const injectLoggingFormatter = () => inject<LoggingFormatter>(FormatterToken);
export const provideLoggingFormatter = (impl: Type<LoggingFormatter>): Provider => ({
  provide: FormatterToken,
  useClass: impl,
});

export const DestinationToken = new InjectionToken("logging destination token");

export const injectLoggingDestination = () =>
  inject<LoggingDestination[]>(DestinationToken);
export const provideLoggingDestination = (impl: Type<LoggingDestination>): Provider => ({
  provide: FormatterToken,
  useClass: impl,
  multi: true,
});
