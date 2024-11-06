export interface IDefer<T> {
	resolve(v: T): void
	reject(e: Error): void
	promise: Promise<T>
}
export interface IBroadcastStream<T> extends AsyncIterable<T> {
	listen(onNext: (value: T) => any, {onError, onDone}?: {
		onError?(error: unknown): any
		onDone?(): any
	}): (this: void) => void
	next(value: T): void
	throw(error: unknown): void
	done(): void
}

export default function makeDefer<T = void>(): IDefer<T> {
	let resolve = undefined as unknown as (value: T | PromiseLike<T>) => void
	let reject = undefined as unknown as (reason?: any) => void
	const promise = new Promise<T>((rs, rj) => {
		resolve = rs
		reject = rj
	})
	return {
		resolve,
		reject,
		promise
	}
}

export function makeBroadcastStream<T>(): IBroadcastStream<T> {
	const listeners: {
		onNext(value: T): any
		onError?(error: unknown): any
		onDone?(): any
	}[] = []
	let done = false
	let defer = makeDefer<IteratorResult<T>>()
	return {
		[Symbol.asyncIterator](): AsyncIterator<T> {
			return {
				async next() {
					if (done) return {value: undefined, done: true}
					const value = await defer.promise
					defer = makeDefer()
					return value
				},
				async return(value?: any) {
					return {value: undefined, done: true}
				},
				async throw(e?: unknown) {
					return {value: undefined, done: true}
				}
			}
		},
		listen(onNext: (value: T) => any, {onError, onDone}: {
			onError?(error: unknown): any
			onDone?(): any
		} = {}) {
			if (done) {
				onDone?.()
				return () => {}
			}
			const listener = {onNext, onError, onDone}
			listeners.push(listener)
			return function removeListener(this: void) {
				const idx = listeners.lastIndexOf(listener)
				if (idx >= 0) listeners.splice(idx, 1)
			}
		},
		next(value: T) {
			if (done) return
			defer.resolve({value, done: false})
			for (const {onNext} of listeners) try {
				onNext(value)
			} catch {}
		},
		throw(error: unknown) {
			if (done) return
			done = true
			defer.reject(error as Error)
			for (const {onError} of listeners) try {
				onError?.(error)
			} catch {}
		},
		done() {
			if (done) return
			done = true
			defer.resolve({value: undefined, done: true})
			for (const {onDone} of listeners) try {
				onDone?.()
			} catch {}
		},
	}
}

export interface ISingleStream<T> extends AsyncIterable<T> {
	next(value: T): void
	throw(error: unknown): void
	done(): void
}
export function makeSingleStream<T>(): ISingleStream<T> {
	// at least one of chunk or defers is empty, all the time
	const chunk: IteratorResult<T>[] = []
	const defers: IDefer<IteratorResult<T>>[] = []
	let done = false
	let error: unknown

	return {
		[Symbol.asyncIterator](): AsyncIterator<T> {
			return {
				async next() {
					if (chunk.length) return chunk.shift()!
					if (done) {
						if (error) throw error
						return {value: undefined, done: true}
					}
					// chunk must currently be empty, it is safe to make defers non-empty
					const defer = makeDefer<IteratorResult<T>>()
					defers.push(defer)
					return defer.promise
				},
				async return(value?: any) {
					return {value: undefined, done: true}
				},
				async throw(e?: unknown) {
					return {value: undefined, done: true}
				}
			}
		},
		next(value: T) {
			if (done) return
			if (defers.length) {
				const defer = defers.shift()!
				defer.resolve({value, done: false})
				return
			}
			// defers must currently be empty, it is safe to make chunk non-empty
			chunk.push({value, done: false})
		},
		throw(err: unknown) {
			if (done) return
			done = true
			error = err
			for (const defer of defers) defer.reject(err as Error)
			defers.length = 0
		},
		done() {
			if (done) return
			done = true
			for (const defer of defers) defer.resolve({value: undefined, done: true})
			defers.length = 0
		},
	}
}
