"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBroadcastStream = void 0;
function makeDefer() {
	let resolve = undefined;
	let reject = undefined;
	const promise = new Promise((rs, rj) => {
		resolve = rs;
		reject = rj;
	});
	return {
		resolve,
		reject,
		promise
	};
}
exports.default = makeDefer;
function makeBroadcastStream() {
	const listeners = [];
	let done = false;
	let defer = makeDefer();
	return {
		[Symbol.asyncIterator]() {
			return {
				async next() {
					const value = await defer.promise;
					defer = makeDefer();
					return value;
				},
				async return(value) {
					return { value: undefined, done: true };
				},
				async throw(e) {
					return { value: undefined, done: true };
				}
			};
		},
		listen(onNext, { onError, onDone } = {}) {
			if (done)
				throw new Error('Cannot listen after done');
			const listener = { onNext, onError, onDone };
			listeners.push(listener);
			return function removeListener() {
				const idx = listeners.lastIndexOf(listener);
				if (idx >= 0)
					listeners.splice(idx, 1);
			};
		},
		next(value) {
			if (done)
				throw new Error('Cannot next after done');
			defer.resolve({ value, done: false });
			for (const { onNext } of listeners)
				try {
					onNext(value);
				}
				catch { }
		},
		throw(error) {
			if (done)
				throw new Error('Cannot throw after done');
			done = true;
			defer.reject(error);
			for (const { onError } of listeners)
				try {
					onError?.(error);
				}
				catch { }
		},
		done() {
			if (done)
				throw new Error('Cannot done after done');
			done = true;
			defer.resolve({ value: undefined, done: true });
			for (const { onDone } of listeners)
				try {
					onDone?.();
				}
				catch { }
		},
	};
}
exports.makeBroadcastStream = makeBroadcastStream;
