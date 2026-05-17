// Polyfill Promise.withResolvers for iOS Safari < 17.4 (and Chrome < 119).
// pdfjs-dist v5 uses it; missing on older mobile browsers causes
// "undefined is not a function" when parsing PDFs.
// Import this file FIRST (before pdfjs) in any context that runs pdfjs.

declare global {
  interface PromiseConstructor {
    withResolvers?<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  }
}

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export {};
