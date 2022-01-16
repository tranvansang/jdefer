"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeDefer = () => {
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
};
exports.default = makeDefer;
