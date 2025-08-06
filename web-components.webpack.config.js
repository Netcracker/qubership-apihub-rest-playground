const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/web-components/index.ts',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      stream: false,
      process: require.resolve('process/browser'),
      querystring: require.resolve('querystring-es3'),
    },
  },
  devtool: 'source-map',
  performance: {
    maxEntrypointSize: 2000000,
    maxAssetSize: 2000000,
  },
  node: { global: true },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    library: "qubership-apihub-rest-playground",
    publicPath: 'auto',
    assetModuleFilename: 'fonts/[hash][ext][query]'
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
    }),
    new MonacoWebpackPlugin({languages :["json"] })
  ],
}
