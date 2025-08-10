const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    index: [
      "./src/web-components/index.ts",
      "monaco-editor/dev/vs/editor/editor.main.css",
      "monaco-editor/min/vs/editor/editor.main.css"
    ]
  },
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
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: 'auto',
    globalObject: 'this',
    library: {
      name: 'qubership-apihub-rest-playground', // Имя глобальной переменной
      type: 'umd',
    },
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
        use: ['style-loader', 'css-loader'],
        include: [
          path.resolve(__dirname, "node_modules/monaco-editor")
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        include: [
          path.resolve(__dirname, "node_modules/monaco-editor")
        ],
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
    // new MonacoWebpackPlugin({languages :["json"], features: ['!gotoSymbol'], publicPath:'./' })
  ],
}
