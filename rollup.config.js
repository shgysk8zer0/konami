import { getConfig } from '@shgysk8zer0/js-utils/rollup';

export default getConfig('./konami.js', {
	format: 'cjs',
	minify: false,
	sourcemap: false,
});
