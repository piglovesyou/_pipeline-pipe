import { promisify } from 'util';
import { pipeline as _pipeline } from 'readable-stream';
// Use Node native "stream" for per-versions compatible testing
import { Transform } from 'stream';
import assert from 'assert';
import { from } from './index';

const pipeline = promisify(_pipeline);

describe('from', () => {
  test('should create a readable stream from an array', async () => {
    const source = [ 2, 3, 4 ];
    const expect = [ 20, 30, 40 ];
    const actual: number[] = [];

    await pipeline(
        from(source),
        new Transform({
          writableObjectMode: true,
          transform(chunk, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
            setTimeout(() => {
              actual.push(chunk * 10);
              callback();
            }, Math.random() * 100);
          }
        }),
    );

    assert.deepStrictEqual(actual, expect);
  }, 10 * 1000);
});
