'use strict'

module.exports = function makeDefer() {
	let resolve = undefined
	let reject = undefined
	const promise = new Promise((rs, rj) => {
		resolve = rs
		reject = rj
	})
	return {
		resolve,
		reject,
		promise
	}
}

module.exports.makeBroadcastStream = function makeBroadcastStream() {
	const listeners = []
	let done = false
	let defer = makeDefer()
	return {
		[Symbol.asyncIterator]() {
			return {
				next() {
					return defer.promise
				},
				return() {
				},
				throw() {
				}
			}
		},
		listen(onNext, {onError, onDone} = {}) {
			if (done)
				throw new Error('Cannot listen after done')
			const listener = {onNext, onError, onDone}
			listeners.push(listener)
			return function removeListener() {
				const idx = listeners.lastIndexOf(listener)
				if (idx >= 0)
					listeners.splice(idx, 1)
			}
		},
		next(value) {
			if (done)
				throw new Error('Cannot next after done')
			defer.resolve({value, done: false})
			for (const {onNext} of listeners)
				onNext(value)
		},
		throw(error) {
			if (done)
				throw new Error('Cannot throw after done')
			done = true
			defer.reject(error)
			for (const {onError} of listeners)
				onError === null || onError === void 0 ? void 0 : onError(error)
		},
		done() {
			if (done)
				throw new Error('Cannot done after done')
			done = true
			defer.resolve({done: true})
			for (const {onDone} of listeners)
				onDone === null || onDone === void 0 ? void 0 : onDone()
		},
	}
}
