const livereload = require('rollup-plugin-livereload')
const resolve = require('rollup-plugin-node-resolve')
const serve = require('rollup-plugin-serve')
const typescript = require('rollup-plugin-typescript2')
const terser = require('@rollup/plugin-terser')
const sourcemaps = require('rollup-plugin-sourcemaps')

const options = [{
  input: 'src/index.ts',
  output: {
    file: 'build/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    typescript(),
    ...(process.env.BUILD !== '1' ? [livereload(), serve()] : [])
  ],
}]

// Only add livereload and serve when not building for production
if (process.env.BUILD === '1') {
  options.push({
    input: 'src/index.ts',
    output: {
      file: 'build/bundle.min.js',
      format: 'iife',
    },
    plugins: [
      resolve(),
      typescript({sourceMap: true, inlineSources: true}),
      sourcemaps(),
      terser()
    ]
  })
}

exports.default = options