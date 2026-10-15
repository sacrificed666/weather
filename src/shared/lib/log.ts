type LogContext = Record<string, unknown>;

// A log line with the app name and the context as JSON
const line = (message: string, context?: LogContext): string =>
  context ? `[weather] ${message} ${JSON.stringify(context)}` : `[weather] ${message}`;

// Server logs that are easy to find among other output
export const log = {
  info(message: string, context?: LogContext): void {
    console.info(line(message, context));
  },
  warn(message: string, context?: LogContext): void {
    console.warn(line(message, context));
  },
  error(message: string, context?: LogContext): void {
    console.error(line(message, context));
  },
};
