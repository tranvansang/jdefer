export interface IDefer<T> {
	resolve(v: T): void;

	reject(e: Error): void;

	promise: Promise<T>;
}

export interface IBroadcastStream<T> extends AsyncIterable<T> {
	listen(onNext: (value: T) => any, {onError, onDone}?: {
		onError?(error: unknown): any;
		onDone?(): any;
	}): (this: void) => void;

	next(value: T): void;

	throw(error: unknown): void;

	done(): void;
}

export default function makeDefer<T = void>(): IDefer<T>;

export declare function makeBroadcastStream<T>(): IBroadcastStream<T>;

export interface ISingleStream<T> extends AsyncIterable<T> {
	next(value: T): void;

	throw(error: unknown): void;

	done(): void;
}

export declare function makeSingleStream<T>(): ISingleStream<T>;
