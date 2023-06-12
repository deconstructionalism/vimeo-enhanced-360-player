const livereload = require('rollup-plugin-livereload')
const resolve = require('rollup-plugin-node-resolve')
const serve = require('rollup-plugin-serve')
const typescript = require('rollup-plugin-typescript2')

const options = {
  input: 'src/index.ts',
  output: {
    file: 'build/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    typescript(),
  ],
}
// Only add livereload and serve when not building for production
if (process.env.BUILD !== '1') {
  options.plugins.push(livereload(), serve())
}

exports.default = options