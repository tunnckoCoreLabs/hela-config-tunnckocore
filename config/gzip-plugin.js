/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright 2017 tunnckoCore and other contributors
 * @license MIT
 */

const fs = require('fs')
const zlib = require('zlib')
const pify = require('pify')

const stat = pify(fs.stat)

module.exports = function gzip (options) {
  options = Object.assign({ minSize: 0 }, options)

  return {
    name: 'gzip',

    onwrite: (details, bundle) => {
      // fallbacks for Rollup < 0.48
      const fp = details.file || details.dest

      return new Promise((resolve, reject) => {
        stat(fp).then((stat) => {
          if (options.minSize && options.minSize > stat.size) {
            return Promise.resolve()
          } else {
            const out = fs.createWriteStream(fp + '.gz').once('error', reject)
            const gzip = zlib.createGzip(options).once('error', reject)

            fs
              .createReadStream(fp)
              .once('error', reject)
              .pipe(gzip)
              .once('error', reject)
              .pipe(out)
              .once('error', reject)
              .on('close', () => resolve())
          }
        })
      })
    },
  }
}
