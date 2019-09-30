# pipeline-pipe

pipeline-pipe provides utilities to deal with Node Stream more casually.

* [pipe](#pipefn-opts)
* [pipeline](#pipelinestream-stream)
* [fromIterable](#fromIteriter)
* [split](#split)

## pipe(fn, opts)

It creates a `Transform` object from a function just as [through2](https://github.com/rvagg/through2) does, **only** it:

* runs in 16 parallel by default, as order remains, thanks to [parallel-transform](https://github.com/mafintosh/parallel-transform). It's configurable by `{maxParallel: number}` 
* runs in `objectMode: true` by default (and configurable by `{objectMode: boolean}`)
* accepts `Promise`d value to be returned, instead of calling `callback(undefined, value)`

Example to scrape HTML and store titles of them in DB:

```js
const {pipeline, Readable} = require('stream');
const {pipe} = require('pipeline-pipe');

pipeline(
    Readable.from([1, 2, 3]),
    pipe(postId => getPost(postId)),      // Async in 16 parallel
    pipe(json => json.postBody),          // As Array.prototype.map
    pipe(parseHTML),                      // Sync transform
    pipe(dom => dom.document.title),      // As Array.prototype.map
    pipe(title => title.includes('important') ? title : null),  // As Array.prototype.filter
    pipe(title => storeInDB(title), {maxParallel: 4}),          // Async in 4 parallel
    (err) => {
        console.info('All done!');
    }
);
```

## pipeline(stream, stream, ...)

A promisified version of `require('stream').pipeline` of Node Stream.

It is equivalent to:

```js
const {promisify} = require('util');
const {pipeline: _pipeline} = require('stream');
const pipeline = promisify(_pipeline);
```

Example:

```js
const {pipeline, pipe} = require('pipeline-pipe');

async function main() {
  await pipeline(
    readable,
    pipe(chunk => chunk.replace('a', 'z')),
    pipe(chunk => storeInDB(chunk)),
  );
  console.log('Done!');
}
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
