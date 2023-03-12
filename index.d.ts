export interface IDefer<T> {
	resolve(v: T): void;

	reject(e: Error): void;

	promise: Promise<T>;
}

export default function makeDefer<T = void>(): IDefer<T>;
