const path = require('path')

const cwd = process.cwd()
const dir = path.dirname(__dirname)

const pkg = require(path.join(cwd, 'package.json'))

// workaround for using `hela` to build itself :D
const hela = pkg.name === 'hela' ? path.join(cwd, pkg.bin.hela) : 'hela'

module.exports = {
  format: `prettier ${pkg.src} --config ${cwd}/.prettierrc --write`,
  lint: `eslint ${pkg.src} --config ${cwd}/.eslintrc.json -f codeframe --fix`,
  style: [`${hela} format`, `${hela} lint`],
  clean: `rimraf ${cwd}/dist`,
  fresh: [
    `${hela} clean`,
    `rimraf ${cwd}/node_modules`,
    'yarn install --offline',
  ],
  test: [
    `rollup -c ${dir}/config/test.js`,
    `nyc --cwd=${cwd} --reporter=lcov node ${cwd}/dist/test.js`,
    `nyc --cwd=${cwd} report`,
    `nyc --cwd=${cwd} check-coverage`,
  ],
  build: [`${hela} clean`, `${hela} build:node`, `${hela} build:browser`],
  'build:node': `rollup -c ${dir}/config/node.js`,
  'build:browser': [
    `${hela} build:browser:modern`,
    `${hela} build:browser:legacy`,
  ],
  'build:browser:modern': `rollup -c ${dir}/config/modern-browsers.js`,
  'build:browser:legacy': `rollup -c ${dir}/config/legacy-browsers.js`,
  docs: 'verb',
  release: [
    `${hela} style`,
    `${hela} build`,
    'semantic-release pre',
    'npm publish',
    'semantic-release post',
  ],
  precommit: [
    'git status --porcelain',
    `${hela} style`,
    `${hela} test`,
    'git add --all',
  ],
  commit: ['simple-commit-message', 'git push'],
}
