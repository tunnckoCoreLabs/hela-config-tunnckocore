/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license tunnckoCore-1.0
 */

const isObject = require('isobject');
const config = require('@std/esm')(module)('./index.mjs');

const interop = (ex) => (isObject(ex) && 'default' in ex ? ex.default : ex);

module.exports = interop(config);
