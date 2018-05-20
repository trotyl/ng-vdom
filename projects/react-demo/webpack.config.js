const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, './index.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../../dist/react-demo')
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html')
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      'ng-vdom': path.resolve(__dirname, '../../dist/ng-vdom'),
      'ng-vdom/bootstrap': path.resolve(__dirname, '../../dist/ng-vdom/bootstrap'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist/react-demo')
  }
}
