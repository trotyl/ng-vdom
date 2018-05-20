import { uglify } from 'rollup-plugin-uglify'

const plugins = []

if (process.env.UGLIFY) {
  plugins.push(uglify())
}

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/platform-browser': 'ng.platformBrowser',
  'ng-vdom': 'ng.vdom',
}

export default {
  input: 'dist/tmp/projects/ng-vdom-bootstrap/src/public_api.js',
  output: {
    name: 'ng.vdom.bootstrap',
    file: 'dist/ng-vdom/bootstrap/fesm2015/bootstrap.js',
    format: 'es',
    globals,
  },
  external: Object.keys(globals),
  plugins,
}
