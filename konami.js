import { EVENT, CODE, DELAY } from './consts.js';
import { isSignal, isAborted } from './funcs.js';

/**
 * `await` the Konami Code being entered
 * @author Chris Zuber <admin@kernvalley.us>
 * @license MIT
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal] The listener will be removed when the given AbortSignal object's abort() method is called
 * @param {Number} [opts.delay=1000] Allowed delay between inputs in ms (min 100)
 * @param  {Boolean} [opts.capture=true] A boolean value indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
 * @param  {EventTarget} [opts.target=globalThis] The target of the keyboard events
 * @returns void
 * @throws {*} Will throw if `signal` aborts or on invalid arguments
 */
export async function konami({ signal, capture = true, delay = DELAY, target = globalThis } = {}) {
	await new Promise((resolve, reject) => {
		if (! (target instanceof EventTarget)) {
			reject(new TypeError('target must be an instance of `EventTarget`'));
		} else if ((! (typeof delay === 'number') && (! Number.isNaN(delay)) || delay < 100)) {
			throw new TypeError('Delay must be an integer >= 100');
		} else if (isAborted(signal)) {
			reject(signal.reason || new DOMException('Operation aborted'));
		} else {
			let n = 0;
			const controller = new AbortController();
			let timeout = NaN;

			target.addEventListener(EVENT, ({ keyCode }) => {
				if (keyCode !== CODE[n++]) {
					n = 0;

					if (Number.isInteger(timeout)) {
						clearTimeout(timeout);
					}
				} else if (n === CODE.length) {
					resolve();
					controller.abort();

					if (Number.isInteger(timeout)) {
						clearTimeout(timeout);
					}
				} else {
					if (Number.isInteger(timeout)) {
						clearTimeout(timeout);
					}

					/*
					 * Do not set timeout if NaN or infinite
					 */
					if (Number.isFinite(delay)) {
						timeout = setTimeout(() => n = 0, delay);
					}
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
