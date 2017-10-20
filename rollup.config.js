const path = require('path');
const builtins = require('builtin-modules');
const babel = require('rollup-plugin-babel');

const cwd = (fp, ...args) => path.join(process.cwd(), fp, ...args);
const pkg = require(cwd('package.json'));

module.exports = {
  input: cwd('test', 'index.mjs'),
  output: {
    file: cwd('dist', 'test.js'),
    format: 'cjs',
  },
  interop: false,
  plugins: [babel({ plugins: ['istanbul'] })],
  external: Object.keys(pkg.dependencies)
    .concat(Object.keys(pkg.devDependencies))
    .concat(builtins),
};
