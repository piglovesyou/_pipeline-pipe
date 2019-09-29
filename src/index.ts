import { Readable, ReadableOptions } from "readable-stream";

export function from(iterable: IterableIterator<any> | Array<any>, opts?: ReadableOptions) {
  if (Array.isArray(iterable)) {
    iterable = iterable.entries();
  }

  return new Readable({
    ...opts,
    objectMode: true,
    read(size: number): void {
      for (let [k, value] of iterable) {
        const canPushMore = this.push(value);
        if (canPushMore === false) return;
      }
      this.push(null);
    },
  });
}

