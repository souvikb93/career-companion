// Polyfills for older iOS Safari / WebKit (used by all iOS browsers).
// pdfjs-dist v5 calls these APIs; missing on iOS < 15.4 causes
// "undefined is not a function" when parsing PDFs.
// Import this FIRST (before pdfjs) in any context that runs pdfjs.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface PromiseConstructor {
    withResolvers?<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  }
  interface ObjectConstructor {
    hasOwn?(o: object, v: PropertyKey): boolean;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    findLast?(predicate: (v: T, i: number, a: T[]) => unknown): T | undefined;
  }
}

// Promise.withResolvers — iOS Safari 17.4+
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

// Object.hasOwn — iOS Safari 15.4+
if (typeof Object.hasOwn !== "function") {
  Object.hasOwn = function (obj: object, key: PropertyKey) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };
}

// Array.prototype.findLast — iOS Safari 15.4+
if (typeof Array.prototype.findLast !== "function") {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, "findLast", {
    value: function <T>(this: T[], predicate: (v: T, i: number, a: T[]) => unknown) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i], i, this)) return this[i];
      }
      return undefined;
    },
    writable: true,
    configurable: true,
  });
}

// structuredClone — iOS Safari 15.4+
// Fallback uses JSON; lossy (no Date, Map, Set, Blob, etc.) but pdfjs uses
// it only for plain message data, so JSON round-trip is sufficient.
if (typeof (globalThis as any).structuredClone !== "function") {
  (globalThis as any).structuredClone = function (v: unknown) {
    return JSON.parse(JSON.stringify(v));
  };
}

// WeakRef — iOS Safari 14.5+
// pdfjs uses it for non-critical caching; stub returns the value directly.
if (typeof (globalThis as any).WeakRef !== "function") {
  (globalThis as any).WeakRef = class WeakRef<T> {
    private _v: T;
    constructor(v: T) {
      this._v = v;
    }
    deref(): T {
      return this._v;
    }
  };
}

export {};
