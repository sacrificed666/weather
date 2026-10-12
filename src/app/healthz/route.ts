// Answers the health checks of Docker and the CI
export const GET = () =>
  new Response("ok\n", { headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });
