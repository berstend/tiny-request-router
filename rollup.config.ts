import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript'

const pkg = require('./package.json')

const pkgName = 'router'
const umdName = 'TinyRequestRouter'
const banner = `
/*!
 * ${pkg.name} v${pkg.version} by ${pkg.author}
 * ${pkg.homepage}
 * @license ${pkg.license}
 */
`.trim()

export default [
  /* router.js and router.mjs */
  {
    input: `src/${pkgName}.ts`,
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true, banner },
      { file: pkg.module, format: 'esm', sourcemap: true, banner }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        typescript: require('typescript')
      })
    ],
    external: ['url-pattern']
  },

  /* router.browser.js and router.browser.mjs */
  {
    input: `src/${pkgName}.ts`,
    output: [
      {
        file: pkg.browser[pkg.main],
        format: 'umd',
        name: umdName,
        sourcemap: true
      },
      {
        file: pkg.browser[pkg.module],
        format: 'esm',
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        typescript: require('typescript')
      })
    ]
  },

  /* router.min.js */
  {
    input: `src/${pkgName}.ts`,
    output: [
      {
        file: pkg.unpkg,
        format: 'umd',
        name: umdName,
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        typescript: require('typescript')
      }),
      terser({ output: { comments: 'some' } })
    ]
  }
]
