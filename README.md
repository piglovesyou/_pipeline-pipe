# pipeline-pipe

Promise oriented Node Stream utilities.

`pipeline` function introduced in Node v10 indicates ...

## pipe

It turns a function to Node `Transform` that accepts Promise return.

Heavily inspired by npm `through` and `parallel-transform`. 

```js
const {pipe} = require('pipeline-pipe');

const transformer = pipe(async function(chunk) {
  this.push('additional');
  this.push('additional');
  await new Promise(resolve => setTimeout(resolve, 100));
  return chunk.replace('a', 'z');
})
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

await pipeline(
  readable,
  pipe((chunk) => chunk.replace('a', 'z')),
);
``` 

is equivalent to

```js
const {promisify} = require('util');
const pipeline = promisify(require('stream').pipeline);
const {pipe} = require('pipeline-pipe');

await pipeline(
  readable,
  pipe((chunk) => chunk.replace('a', 'z')),
);
```

## from

Just as `Readable.from` introduced in Node v12.3, `from` create a readable stream from `Iterable`. 

```js
const {from} = require('pipeline-pipe');

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
