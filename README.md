# Javascript promise defer library

# Install

```bash
yarn add jdefer
```

# Usage

## Single promise with defer

In 2024: recommended using [`Promise.withResolvers()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers).

```typescript
import makeDefer from 'jdefer'
// or
const makeDefer = require('jdefer')

const defer = makeDefer()

// to reject
defer.reject(new Error('foo'))

// to resolve
defer.resolve('bar')

// to wait
await defer.promise
```

## Broadcast stream

```typescript
import {makeBroadcastStream} from 'jdefer'
// or
const {makeBroadcastStream} = require('jdefer')

const stream = makeBroadcastStream()

// to listen
const removeListener = stream.listen(
	(value) => {
		console.log(value)
	}, {
		onDone() {
			console.log('done')
		},
		onError(error) {
			console.error(error)
		},
	})

// to stop listening
removeListener()

// to broadcast
stream.next('foo')
// to broadcast error
stream.throw(new Error('bar'))
// to broadcast done
stream.done()
// iterate
for await (const value of stream) {
	console.log(value)
}
```
