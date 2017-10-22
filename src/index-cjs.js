/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const isObject = require('isobject');

// force ".js", because static analysis services/tools and other things
// does not recognize, and practically there is no way even through their
// configs to accomplish this. That's why we must stick to ".js" for now.
const config = require('@std/esm')(module, { esm: 'js' })('./index-esm.js');

const interop = (ex) => (isObject(ex) && 'default' in ex ? ex.default : ex);

module.exports = interop(config);
