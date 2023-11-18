export interface IDefer<T> {
	resolve(v: T): void;

	reject(e: Error): void;

	promise: Promise<T>;
}

export default function makeDefer<T = void>(): IDefer<T>;

export declare function makeBroadcastStream<T>(): {
	[x: number]: () => AsyncIterator<T>;
	listen(onNext: (value: T) => any, {onError, onDone}?: {
		onError?(error: unknown): any;
		onDone?(): any;
	}): (this: void) => void;
	next(value: T): void;
	throw(error: unknown): void;
	done(): void;
};
