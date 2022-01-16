export interface IDefer<T> {
	resolve(v: T): any;
	reject(e: Error): any;
	promise: Promise<T>;
}
declare const makeDefer: <T>() => IDefer<T>;
export default makeDefer;
