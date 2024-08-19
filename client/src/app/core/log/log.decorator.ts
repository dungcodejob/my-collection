import { Application } from "src/app/application";
import { LogService } from "./log.service";
export function Log(): MethodDecorator {
  return (_: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const origin = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (Application.injector) {
        const logService = Application.injector.get(LogService);
        logService.log(`Calling ${propertyKey.toString()}`);
      }

      return origin.apply(this, args);
    };

    return descriptor;
  };
}
