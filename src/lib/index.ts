export const isBrowser = typeof window !== "undefined";

export const invariant = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

export const noop = () => {};
