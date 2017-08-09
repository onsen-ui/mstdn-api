import * as path from 'path'
import * as webpack from 'webpack'

const config: webpack.Configuration = {
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mastodon.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  }
}

export default config
