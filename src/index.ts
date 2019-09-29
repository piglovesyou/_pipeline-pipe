import { Readable, ReadableOptions, TransformOptions } from "readable-stream";
import { ParallelTransform } from '@piglovesyou/parallel-transform';

export function from(iterable: IterableIterator<any> | Array<any>, opts?: ReadableOptions) {
  if (Array.isArray(iterable)) {
    iterable = iterable.entries();
  }

  return new Readable({
    ...opts,
    objectMode: true,
    read(size: number): void {
      for (let [ k, value ] of iterable) {
        const canPushMore = this.push(value);
        if (canPushMore === false) return;
      }
      this.push(null);
    },
  });
}

type TransformFn = (this: ParallelTransform, data: any) => any;

type PipeOpts = TransformOptions & {
  ordered?: boolean,
  maxParallel?: number,
};

const defaultMaxParallel = 16;

export function pipe(transformFn: TransformFn, opts: PipeOpts = {}): ParallelTransform {
  return new ParallelTransform(
      opts.maxParallel || defaultMaxParallel,
      opts,
      function (this: ParallelTransform, data, callback) {
        const returned = transformFn.call(this, data);
        Promise.resolve(returned)
            .then((resovledValeu) => callback(undefined, resovledValeu))
            .catch(callback);
      },
  );
}
