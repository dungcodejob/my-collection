import { Pipe, type PipeTransform } from "@angular/core";

type Args<T = unknown> = T[];
type FunctionWithArgs<T extends Args, R> = (...args: T) => R;
type FunctionWithoutArgs<R> = () => R;
type Function<T extends unknown[], R> = FunctionWithArgs<T, R> | FunctionWithoutArgs<R>;

const error_this = function () {
  throw new Error(
    `DON'T USE this INSIDE A FUNCTION CALLED BY | call OR | apply IT MUST BE A PURE FUNCTION!`
  );
};
const NO_THIS = !("Proxy" in window)
  ? Object.seal({})
  : new Proxy(
      {},
      {
        get: error_this,
        set: error_this,
        deleteProperty: error_this,
        has: error_this,
      }
    );

@Pipe({
  name: "function",
  standalone: true,
})
export class FunctionPipe implements PipeTransform {
  transform<R>(fn: FunctionWithoutArgs<R>): R;
  transform<T extends Args, R>(fn: FunctionWithArgs<T, R>, data: T): R;
  transform<T extends Args, R>(fn: Function<T, R>, data?: T): R {
    if (!fn || typeof fn !== "function") {
      throw new TypeError("You must pass a PURE function to | call");
    }

    if (data) {
      return fn.apply(data);
    }
    return fn.apply(NO_THIS);
  }
}
