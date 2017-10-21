/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const isObject = require('isobject');
const config = require('@std/esm')(module, { esm: 'js' })('./index-esm.js');

const interop = (ex) => (isObject(ex) && 'default' in ex ? ex.default : ex);

module.exports = interop(config);
