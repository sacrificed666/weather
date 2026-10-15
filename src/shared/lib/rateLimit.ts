export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  maxKeys?: number;
}

interface Window {
  count: number;
  resetAt: number;
}

// A fixed window limiter per key that never grows without bound
export const createRateLimiter = ({ limit, windowMs, now = Date.now, maxKeys = 10_000 }: RateLimiterOptions) => {
  const windows = new Map<string, Window>();

  // Drops the windows that have ended
  const forgetExpired = (time: number) => {
    for (const [key, window] of windows) if (window.resetAt <= time) windows.delete(key);
  };

  // Frees a slot when too many visitors are tracked, oldest first
  const makeRoom = (time: number) => {
    forgetExpired(time);
    for (const key of windows.keys()) {
      if (windows.size < maxKeys) return;
      windows.delete(key);
    }
  };

  return (key: string) => {
    const time = now();
    if (windows.size >= maxKeys && !windows.has(key)) makeRoom(time);
    const window = windows.get(key);
    if (!window || window.resetAt <= time) {
      windows.set(key, { count: 1, resetAt: time + windowMs });
      return true;
    }
    window.count += 1;
    return window.count <= limit;
  };
};
