import { EVENT, CODE } from './consts.js';
import { isSignal, isAborted } from './funcs.js';

/**
 * `await` the Konami Code being entered
 * @async
 * @module konami/konami
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal] The listener will be removed when the given AbortSignal object's abort() method is called
 * @param  {Boolean} [opts.capture] A boolean value indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
 * @param  {EventTarget} [opts.target=globalThis] The target of the keyboard events
 * @throws {*} Will throw if `signal` aborts or if `target` is not an `EventTarget`
 * @author Chris Zuber <admin@kernvalley.us>
 * @license MIT
 */
export async function konami({ signal, capture, target = globalThis } = {}) {
	await new Promise((resolve, reject) => {
		if (! (target instanceof EventTarget)) {
			reject(new TypeError('target must be an instance of `EventTarget`'));
		} else if (isAborted(signal)) {
			reject(signal.reason || new DOMException('Operation aborted'));
		} else {
			let n = 0;
			const controller = new AbortController();

			target.addEventListener(EVENT, ({ keyCode }) => {
				if (keyCode !== CODE[n++]) {
					n = 0;
				} else if (n === CODE.length) {
					resolve();
					controller.abort();
				}
			}, { signal: controller.signal, passive: true, capture });

			if (isSignal(signal)) {
				signal.addEventListener('abort', ({ target: { reason }}) => {
					reject(reason || new DOMException('Operation aborted'));
					controller.abort(reason);
				}, { once: true, signal: controller.signal });
			}
		}
	});
}
