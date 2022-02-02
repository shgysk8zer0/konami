/**
 * Checks if something is an `AbortSignal` (if supported in the global object)
 * @returns {Boolean}
 */
export function isSignal(signal) {
	return 'AbortSignal' in globalThis && signal instanceof globalThis.AbortSignal;
}

/**
 * Checks if something is an aborted `AbortSignal`
 * @returns {Boolean}
 */
export function isAborted(signal) {
	return isSignal(signal) && signal.aborted;
}
