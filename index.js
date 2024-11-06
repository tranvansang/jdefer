'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.default = makeDefer
exports.makeBroadcastStream = makeBroadcastStream

function makeDefer() {
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

function makeBroadcastStream() {
	const listeners = []
	let done = false
	let defer = makeDefer()
	return {
		[Symbol.asyncIterator]() {
			return {
				async next() {
					if (done)
						return {value: undefined, done: true}
					const value = await defer.promise
					defer = makeDefer()
					return value
				},
				async return(value) {
					return {value: undefined, done: true}
				},
				async throw(e) {
					return {value: undefined, done: true}
				}
			}
		},
		listen(onNext, {onError, onDone} = {}) {
			if (done) {
				onDone?.()
				return () => {
				}
			}
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
				return
			defer.resolve({value, done: false})
			for (const {onNext} of listeners)
				try {
					onNext(value)
				} catch {
				}
		},
		throw(error) {
			if (done)
				return
			done = true
			defer.reject(error)
			for (const {onError} of listeners)
				try {
					onError?.(error)
				} catch {
				}
		},
		done() {
			if (done)
				return
			done = true
			defer.resolve({value: undefined, done: true})
			for (const {onDone} of listeners)
				try {
					onDone?.()
				} catch {
				}
		},
	}
}
