'use strict'

module.exports = makeDefer
function makeDefer() {
	let resolve = undefined
	let reject = undefined
	const promise = new Promise((rs, rj) => {
		resolve = rs
		reject = rj
	})
	return {
		resolve,
		reject,
		promise
	}
}

exports.default = makeDefer
