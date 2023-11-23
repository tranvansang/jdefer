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
				next() {
					const {promise} = defer
					defer = makeDefer()
					return promise
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
			if (done) throw new Error('Cannot listen after done')
			const listener = {onNext, onError, onDone}
			listeners.push(listener)
			return function removeListener(this: void) {
				const idx = listeners.lastIndexOf(listener)
				if (idx >= 0) listeners.splice(idx, 1)
			}
		},
		next(value: T) {
			if (done) throw new Error('Cannot next after done')
			defer.resolve({value, done: false})
			for (const {onNext} of listeners) try {
				onNext(value)
			} catch {}
		},
		throw(error: unknown) {
			if (done) throw new Error('Cannot throw after done')
			done = true
			defer.reject(error)
			for (const {onError} of listeners) try {
				onError?.(error)
			} catch {}
		},
		done() {
			if (done) throw new Error('Cannot done after done')
			done = true
			defer.resolve({value: undefined, done: true})
			for (const {onDone} of listeners) try {
				onDone?.()
			} catch {}
		},
	}
}
