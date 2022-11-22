const path = require('path');
const { readdirSync, statSync } = require('fs');
const dev = process.argv.includes('--watch');

function readRecursively(src) {
	const files = [];
	const dirs = [src];
	while (dirs.length) {
		const shifted = dirs.shift();
		for (const i of readdirSync(shifted)) {
			const resolved = path.resolve(shifted, i);
			const stats = statSync(resolved);
			if (stats.isDirectory()) {
				dirs.push(resolved);
			} else {
				files.push(resolved);
			}
		}
	}
	return files;
}

require('esbuild').build({
	format: 'cjs',
	bundle: true,
	tsconfig: 'tsconfig.json',
	sourcemap: dev ? 'inline' : false,
	outdir: '../main/webapp/scripts/',
	platform: 'browser',
	minifyIdentifiers: !dev,
	minifySyntax: !dev,
	minifyWhitespace: !dev,
	minify: !dev,
	watch: dev,
	entryPoints: readRecursively(path.resolve(__dirname, 'src')),
}).then(e => {
	console.log('build result:', e);
});
