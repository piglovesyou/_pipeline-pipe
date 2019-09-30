# pipeline-pipe

pipeilne-utils provide 3 useful functions for Async Stream task consuming.

* [pipe](#pipe)
* [pipeline](#pipeline)
* [fromIterable](#fromIterable)

`pipeline` function introduced in Node v10 indicates ...

## pipe

It creates a `Transform` from a function, just as [through2](https://github.com/rvagg/through2) does, **only** it:

* accepts `Promise`d value to be returned, instead of calling `callback(undefined, value)`
* runs in `objectMode: true` by default (and configurable by `{objectMode: boolean}`)
* runs in 16 parallel by default (and it's configurable by `{maxParallel: number}`)

Example:

```js
import {pipe} from './src';

console.time('parallel-transform');
const t = pipe(data => {
  return new Promise(resolve => {
    // Some kind of async execution taking 1sec
    setTimeout(resolve, 1000);
  })
}, {maxParallel: 2});

t.on('finish', () => {
  // Took about 2 seconds
  console.timeEnd('parallel-transform');
});

// Three streaming data
t.write('yeah');
t.write('yeah');
t.write('yeah');

t.end();
```


```js
const {pipeline} = require('stream');
const {pipe} = require('pipeline-pipe');

pipeline(
    Readable.from([1, 2, 3]),
    pipe(postId => getPost(postId)),
    pipe(json => json.postBody),
    pipe(bodyHTML => parseHTML(bodyHTML)),
    pipe(dom => dom.document.title),
    pipe(title => storeInDB(title), {maxParallel: 4}),
    (err) => {
        console.info('All done!');
    }
);
```

is equivalent to

```js
const {Transform} = require('stream');

const transformer = new Transform({
  transform(chunk, enc, callback) {
    this.push('additional');
    this.push('additional');
    setTimeout(() => {
      callback(null, chunk.replace('a', 'z'));
    });
  },
});
```

## pipeline

Just a promisified version of require('stream').pipeline of Node Stream.

```js
const {pipeline, pipe} = require('pipeline-pipe');

async function main() {
  await pipeline(
    readable,
    pipe(chunk => chunk.replace('a', 'z')),
  );
}
``` 

is equivalent to

```js
const {promisify} = require('util');
const pipeline = promisify(require('stream').pipeline);
const {pipe} = require('pipeline-utils');

await pipeline(
  readable,
  pipe((chunk) => chunk.replace('a', 'z')),
);
```

## from

Just as `Readable.from` introduced in Node v12.3, `from` create a readable stream from `Iterable`. 

```js
const {from} = require('pipeline-utils');

const readable = from([2, 3, 4]);
```

is equivalent to

```js
const {Readable} = require('stream')

const readable = Readable.from([2, 3, 4]);
```

and is also almost equivalent to

```js
const {Readable} = require('stream')

const arr = [2, 3, 4];
let currIndex = 0;
const r = new Readable({
  objectMode: true,
  read(size) {
    for (let n of arr) {
      const value = arr[currIndex];
      const result = this.push(value || null);
      if (result === false) return;
      currIndex++;
    }
  },
});
```

## License

MIT
