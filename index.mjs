export default function makeDefer() {
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

export function makeBroadcastStream() {
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
				onDone === null || onDone === void 0 ? void 0 : onDone()
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
				onNext(value)
		},
		throw(error) {
			if (done)
				return
			done = true
			defer.reject(error)
			for (const {onError} of listeners)
				onError === null || onError === void 0 ? void 0 : onError(error)
		},
		done() {
			if (done)
				return
			done = true
			defer.resolve({value: undefined, done: true})
			for (const {onDone} of listeners)
				onDone === null || onDone === void 0 ? void 0 : onDone()
		},
	}
}

export function makeSingleStream() {
	// at least one of chunk or defers is empty, all the time
	const chunk = []
	const defers = []
	let done = false
	let error
	return {
		[Symbol.asyncIterator]() {
			return {
				async next() {
					if (chunk.length)
						return chunk.shift()
					if (done) {
						if (error)
							throw error
						return {value: undefined, done: true}
					}
					// chunk must currently be empty, it is safe to make defers non-empty
					const defer = makeDefer()
					defers.push(defer)
					return defer.promise
				},
				async return(value) {
					return {value: undefined, done: true}
				},
				async throw(e) {
					return {value: undefined, done: true}
				}
			}
		},
		next(value) {
			if (done)
				return
			if (defers.length) {
				const defer = defers.shift()
				defer.resolve({value, done: false})
				return
			}
			// defers must currently be empty, it is safe to make chunk non-empty
			chunk.push({value, done: false})
		},
		throw(err) {
			if (done)
				return
			done = true
			error = err
			for (const defer of defers)
				defer.reject(err)
			defers.length = 0
		},
		done() {
			if (done)
				return
			done = true
			for (const defer of defers)
				defer.resolve({value: undefined, done: true})
			defers.length = 0
		},
	}
}
