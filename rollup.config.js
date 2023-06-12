const livereload = require('rollup-plugin-livereload')
const resolve = require('rollup-plugin-node-resolve')
const serve = require('rollup-plugin-serve')
const typescript = require('rollup-plugin-typescript2')

exports.default = {
  input: 'src/index.ts',
  output: {
    file: 'build/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    typescript(),
    serve(),
    livereload(),
  ],
}