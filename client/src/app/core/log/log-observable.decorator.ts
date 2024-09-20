import { Observable, tap } from "rxjs";

export function LogObservable(): PropertyDecorator {
  let propertyValue: unknown;

  return (target: object, propertyKey: string | symbol) => {
    function getter() {
      return propertyValue;
    }

    function setter(value: unknown) {
      if (value instanceof Observable) {
        propertyValue = value.pipe(
          tap(res => {
            const isArrayOfObjects = Array.isArray(res) && typeof res[0] === "object";
            const logType = isArrayOfObjects ? "table" : "log";
            // eslint-disable-next-line no-console
            console.groupCollapsed(propertyKey);
            // eslint-disable-next-line no-console
            console[logType](res);
            // eslint-disable-next-line no-console
            console.groupEnd();
          })
        );
      } else {
        propertyValue = value;
      }
    }

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
