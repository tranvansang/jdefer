export interface IDefer<T> {
	resolve(v: T): void
	reject(e: Error): void
	promise: Promise<T>
}

const makeDefer = <T>(): IDefer<T> => {
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

export default makeDefer
