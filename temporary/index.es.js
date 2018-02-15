import fs from 'fs';
import path from 'path';
import rollup from 'rollup';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import pify from 'pify';
import pMap from 'p-map';
import timeStamp from 'time-stamp';
import isobject from 'isobject';
import pIsPromise from 'p-is-promise';
import prettyConfig from '@tunnckocore/pretty-config';
import builtinModules from 'builtin-modules';
import isCi from 'is-ci';

function createCommonjsModule(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

/* eslint-disable import/max-dependencies, import/no-nodejs-modules */

/* eslint-disable */
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  const target = {};
  const sourceKeys = Object.keys(source);
  let key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  if (Object.getOwnPropertySymbols) {
    const sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
/* eslint-enable */

function arrayify(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

function getName(fp) {
  const ext = path.extname(fp);
  const basename = path.basename(fp, ext);
  return basename;
}

/**
 * TODO
 *
 * @param {*} bundle
 * @param {*} outputOptions
 */
// function rollupGenerate(bundle, outputOptions) {
//   return bundle.generate(outputOptions).then(({ code, map }) => ({
//     outputOptions,
//     code,
//     map,
//   }));
// }

function rollupWrite(bundle, inputOptions_, outputOptions) {
  const inputOptions = _objectWithoutProperties(inputOptions_, ['output']);

  return bundle.write(outputOptions).then(() => ({ inputOptions, outputOptions }));
}

let CACHE = null;
async function rolldown(config) {
  /**
   * If returned is Rollup Config object
   */

  if (isobject(config)) {
    const opts = Object.assign({}, config);

    if (Array.isArray(opts.input) && !opts.experimentalCodeSplitting) {
      const cfg = multipleInputs(opts);

      return rolldown(cfg);
    }

    if (opts.input && opts.output) {
      const outputs = arrayify(opts.output).reduce(
        (acc, item) => acc.concat(typeof item === 'string' ? { format: item } : item),
        [],
      );
      opts.output = outputs;
      opts.cache = CACHE;

      const bundle = await rollup.rollup(opts);
      CACHE = bundle;

      const targetMapper = createMapper(bundle, opts);

      return pMap(outputs, targetMapper);
    }

    /**
     * If configs found, but for example only `plugins` is given,
     * then extend the defaults with these coming configs.
     */

    const ob = await extendDefaults(opts);
    console.log(ob);
    return [];
    // return rolldown(extendDefaults(opts))
  }

  /**
   * If returned is Array of Rollup Config objects
   */

  if (Array.isArray(config)) {
    return pMap(config, (cfg) => rolldown(cfg));
  }

  /**
   * If not found configs and not passed,
   * then create some basic defaults.
   * The `config` is `null` here.
   */

  console.log('config', config);
  return [];
  // return rolldown(createDefaults())
}

function multipleInputs(opts) {
  return opts.input.filter(Boolean).reduce((acc, inputItem) => {
    const input = _objectWithoutProperties(inputItem, ['input']);

    return acc.concat(Object.assign({ input }, opts));
  }, []);
}

function createMapper(bundle, opts) {
  return function targetMapper(outputOptions) {
    const outFile = outputOptions.file || opts.file;
    let options = null;

    // if `output.file` exist, use it;
    // otherwise create `output.file` from given `input` and `output.format`
    if (outFile) {
      // support basic placeholders
      const file = outFile
        .replace('[date]', timeStamp())
        .replace('[name]', getName(opts.input))
        .replace('[format]', outputOptions.format);

      options = { file };
    } else {
      // construct `foo.es.js`
      const fmt = outputOptions.format;
      const basename = `${getName(opts.input)}.${fmt}.js`;
      const file = path.join('dist', basename);
      options = { file };
    }

    options = Object.assign({}, outputOptions, options);

    return rollupWrite(bundle, opts, options);
  };
}

async function extendDefaults(incomingOptions) {
  const filepath = 'src/cli.js';
  const hasCLI = fs.existsSync(filepath);

  return Object.assign(
    {
      input: ['src/index.js', hasCLI ? filepath : false],
      output: [{ format: 'cjs' }, { format: 'es' }],
      external: builtinModules,
    },
    incomingOptions,
  );
}

function getPkg(cwd) {
  return pify(fs.readFile)(path.join(cwd, 'package.json'), 'utf8').then(JSON.parse);
}

async function run(cwd) {
  const configFiles = prettyConfig.configFiles
    .slice(0, -1)
    .reduce((acc, item) => acc.concat(`src/${item}`, item), [])
    .concat('package.json');

  let settings = await prettyConfig('rollup', { configFiles });

  if (!settings) {
    settings = await prettyConfig('rolldown', { configFiles });
  }

  if (pIsPromise(settings)) {
    settings = await settings;
  }

  const pkg = await getPkg(cwd);
  settings.external = builtinModules.concat(Object.keys(pkg.dependencies));
  settings.plugins = [rollupPluginCommonjs()];

  return rolldown(settings);
}

/**
 * CLI?
 */

const rolldown_1 = async function runnerWithLog(cwd) {
  const results = await run(cwd);
  const res = results.reduce((acc, config) => acc.concat(config), []).filter(Boolean);

  const log = (cfg) => {
    console.log(cfg.inputOptions.input, '->', cfg.outputOptions.file);
  };

  res.forEach((config) => {
    if (Array.isArray(config)) {
      config.forEach(log);
    } else {
      log(config);
    }
  });
};

const src = createCommonjsModule((module) => {
  /**
   * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
   * @license Apache-2.0
   */

  /**
   * Switch to ES Modules, when `resolve-plugins` async is done.
   *
   * Reminder: Only needed deps which should remain
   * when the `rolldown` is released (currently live here).
   *
   * "dependencies": {
   *   "eslint": "^4.17.0",
   *   "eslint-config-xaxa": "^0.2.2",
   *   "gitcommit": "^0.2.4",
   *   "is-ci": "^1.1.0",
   *   "new-release": "^4.0.1",
   *   "nyc": "^11.4.1"
   * }
   */

  /* eslint-disable import/prefer-default-export, import/no-commonjs, import/no-nodejs-modules */

  const lint = async ({ argv, shell }) => {
    let cmd = 'eslint src test -f codeframe --quiet --fix';

    if (argv.dry) {
      cmd = `${cmd} --fix-dry`;
    } else {
      cmd = `${cmd} --fix`;
    }

    return shell(cmd);
  };

  const build = async ({ shell, cwd }) => {
    await shell('rm -rf dist');
    await rolldown_1(cwd);
  };

  const test = async ({ argv, shell, cwd }) => {
    const opts = Object.assign({ path: 'test' }, argv);
    const cmd = `node ${opts.path}`;

    await build({ cwd, shell });

    if (opts.cov === false) {
      return shell(`node ${opts.path}`);
    }
    if (opts.check === false) {
      return shell([`nyc --reporter=lcov ${cmd}`, 'nyc report']);
    }

    return shell([`nyc --reporter=lcov ${cmd}`, 'nyc report', 'nyc check-coverage']);
  };

  const commit = async ({ argv, shell }) => {
    if (argv.lint !== false) {
      await lint({ argv, shell });
    }

    if (argv.dry) {
      return shell(['git add --all', 'gitcommit -s -S']);
    }

    if (argv.docs !== false) {
      await shell('yarn start docs');
    }

    if (argv.test !== false) {
      await test({ argv, shell });
    }

    return shell(['git status --porcelain', 'git add --all', 'gitcommit -s -S']);
  };

  const docs = 'verb';
  const release = 'new-release';

  const protect = async () => {
    if (!isCi) {
      const msg = 'the "npm publish" is forbidden, we release and publish on CI service';
      throw new Error(msg);
    }
  };

  const tasks = {
    lint,
    test,
    commit,
    docs,
    build,
    release,
    protect,
  };

  module.exports = { tasks };
});

const src_1 = src.tasks;

export default src;
export { src_1 as tasks };
