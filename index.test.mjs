import assert from 'node:assert'
import test, {describe} from 'node:test'
import makeDefer, {makeBroadcastStream} from './index.mjs'

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
