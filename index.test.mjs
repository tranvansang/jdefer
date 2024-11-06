import assert from 'node:assert'
import test, {describe} from 'node:test'
import makeDefer, {makeBroadcastStream, makeSingleStream} from './index.mjs'

describe('makeDefer', () => {
	test('simple', async () => {
		const defer = makeDefer()
		defer.resolve(1)
		assert.strictEqual(await defer.promise, 1)
	})
})
describe('makeBroadcastStream', () => {
	test('simple', () => {
		const stream = makeBroadcastStream()
		const removeListener = stream.listen(console.log)
		stream.next(10)
		stream.next(20)
		removeListener()
	})
})

describe('makeSingleStream', () => {
	test('simple', async () => {
		const stream = makeSingleStream()
		const iter = stream[Symbol.asyncIterator]()
		stream.next(10)
		stream.next(20)
		stream.done()
		assert.deepStrictEqual(await iter.next(), {value: 10, done: false})
		assert.deepStrictEqual(await iter.next(), {value: 20, done: false})
		assert.deepStrictEqual(await iter.next(), {value: undefined, done: true})

		const iter2 = stream[Symbol.asyncIterator]()
		assert.deepStrictEqual(await iter2.next(), {value: undefined, done: true})
	})
})
