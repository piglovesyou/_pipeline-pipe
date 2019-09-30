# pipeline-pipe

pipeline-pipe provides utilities to deal with Node stream more fluently.

* [pipe](#pipefn-opts)
* [pipeline](#pipelinestream-stream)
* [fromIterable](#fromIteriter)
* [split](#split)

## pipe(fn, opts)

It creates a `Transform` object from a function as [through2](https://github.com/rvagg/through2) does, **only** it:

* runs in 16 parallel by default (and configurable by `{maxParallel: number}`), thanks to [parallel-transform](https://github.com/mafintosh/parallel-transform)
* accepts `Promise`d value to be returned, instead of calling `callback(undefined, value)`
* runs in `objectMode: true` by default (and configurable by `{objectMode: boolean}`)

Example:

```js
import {pipe} from './src';

console.time('parallel-transform');
const t = pipe(data => {
  return new Promise(resolve => {
    // Some kind of async execution
    setTimeout(resolve, 1000);
  })
}, {maxParallel: 2});

t.on('finish', () => {
  // Took about 2 seconds since it consumes two at once
  console.timeEnd('parallel-transform');
});

// 3 streaming data
t.write('yeah');
t.write('yeah');
t.write('yeah');

t.end();
```

Another example to scrape HTML and store titles of them in DB:

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

## pipeline(stream, stream, ...)

A promisified version of `require('stream').pipeline` of Node Stream.

```js
const {pipeline, pipe} = require('pipeline-pipe');

async function main() {
  await pipeline(
    readable,
    pipe(chunk => chunk.replace('a', 'z')),
    pipe(chunk => storeInDB(chunk)),
  );
}
``` 

`require('pipeline-pipe').pipeline` is equivalent to

```js
const {promisify} = require('util');
const pipeline = promisify(require('stream').pipeline);
```

## fromIter(iter)

Just as `Readable.from` introduced in Node v12.3, `from` create a readable stream from `Iterable`. 

```js
const {from} = require('pipeline-utils');

const readable = from([2, 3, 4]);
```

is equivalent to

```js
// Node v12.3+
const {Readable} = require('stream')

const readable = Readable.from([2, 3, 4]);
```

and is also almost equivalent to

```js
const {Readable} = require('stream')

const readable = new Readable({
  objectMode: true,
  read(size) {
    for (let n of [2, 3, 4]) this.push(n);
    this.push(null);
  },
});
```

## split()

It returns a `Transform` object to split incoming `Array` into elements to following stream.

```js
const {pipeline} = require('stream');
const {split} = require('pipeline-pipe');

pipeline(
    Readable.from([1, 2, 3]),
    pipe(page => getPostsByPage(page)),
    pipe(json => json.posts),
    pipe(split()),
    pipe(post => post.title),
    pipe(title => storeInDB(title), {maxParallel: 4}),
    (err) => {
        console.info('All done!');
    }
);
```

## License

MIT
