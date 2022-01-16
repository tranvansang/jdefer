export interface IDefer<T> {
	resolve(v: T): void;
	reject(e: Error): void;
	promise: Promise<T>;
}
declare const makeDefer: <T>() => IDefer<T>;
export default makeDefer;
