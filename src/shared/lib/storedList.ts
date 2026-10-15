export interface StoredList<Item> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly Item[];
  getServerSnapshot: () => readonly Item[];
  replace: (items: readonly Item[]) => void;
}

// Reads local storage, which may be blocked
const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

// Writes local storage, which may be full or blocked
const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

// Parsed JSON, or null when it is broken
const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

interface StoredListOptions<Item> {
  parse: (value: unknown) => Item | null;
  limit: number;
  isSame?: (a: Item, b: Item) => boolean;
}

// Drops later entries that describe an item already in the list
const unique = <Item>(items: readonly Item[], isSame: (a: Item, b: Item) => boolean) =>
  items.filter((item, index) => items.findIndex((other) => isSame(other, item)) === index);

// A list in local storage shared by every component and tab
export const createStoredList = <Item>(
  key: string,
  { parse, limit, isSame }: StoredListOptions<Item>,
): StoredList<Item> => {
  const empty: readonly Item[] = [];
  const listeners = new Set<() => void>();
  let cached: { raw: string | null; items: readonly Item[] } = { raw: null, items: empty };

  // The parsed list, reused while the stored text is unchanged
  const getSnapshot = () => {
    const raw = readStorage(key);
    if (raw === cached.raw) return cached.items;
    const parsed = raw === null ? null : parseJson(raw);
    const valid = Array.isArray(parsed) ? parsed.map(parse).filter((item): item is Item => item !== null) : empty;
    const items = valid.length > 0 ? (isSame ? unique(valid, isSame) : valid).slice(0, limit) : empty;
    cached = { raw, items };
    return items;
  };

  // Tells every subscriber that the list changed
  const notify = () => {
    for (const listener of listeners) listener();
  };

  // Another tab changed the list or cleared the storage
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify();
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => empty,
    replace: (items) => {
      if (writeStorage(key, JSON.stringify(items.slice(0, limit)))) notify();
    },
  };
};
