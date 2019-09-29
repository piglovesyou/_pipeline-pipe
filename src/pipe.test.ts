import { promisify } from 'util';
import { pipeline as _pipeline, Readable } from 'readable-stream';
import assert from 'assert';
import { pipe } from './index';

const pipeline = promisify(_pipeline);

describe('pipe', () => {
  it('should pass data through correctly', async () => {
    const source = [ 0, 1, 2, 3, 4 ];
    const expected = [ 30, 40 ];
    const actual: number[] = [];
    const r = new Readable({
      objectMode: true,
      read(size: number): void {
        for (let n of source) this.push(n);
        this.push(null);
      }
    });
    await pipeline(
        r,
        pipe(async (n) => {
          await timeout(Math.random() * 10);
          if (n > 2) return n;
        }),
        pipe(async (n) => {
          await timeout(Math.random() * 10);
          return n * 10;
        }),
        pipe(async (n) => {
          actual.push(n);
        }),
    );
    assert.deepStrictEqual(actual, expected);
  }, 10 * 1000);
});

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(ms)));
}
