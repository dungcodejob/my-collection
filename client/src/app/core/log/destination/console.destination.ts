import { LoggingDestination } from "./logging.destination";

export class ConsoleDestination implements LoggingDestination {
  log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}
