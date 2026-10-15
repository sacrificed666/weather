import type { Instrumentation } from "next";

import { log } from "@/shared/lib/log";

// The reference the error screen shows, so a report can be matched with the log
const digestOf = (error: unknown) =>
  typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : null;

// Logs every failed request with its digest and route pattern, never the address
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  log.error("A request failed", {
    digest: digestOf(error),
    method: request.method,
    route: context.routePath,
    type: context.routeType,
    revalidate: context.revalidateReason ?? null,
    message: error instanceof Error ? error.message : String(error),
  });
};
