const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/web-components/index.ts',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      stream: false,
      path: false,
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
    filename: 'index.js',
    path: path.join(process.cwd(), 'dist'),
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        resolve: { fullySpecified: false },
      },
      // Основной CSS Monaco Editor (темы, подсветка, codicons)
      {
        test: /editor\.main\.css$/,
        include: /node_modules\/monaco-editor/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: false, url: true }
          }
        ]
      },
      // CSS из esm/vs (inlineCompletions, inspectTokens и др.)
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'node_modules/monaco-editor/esm/vs')
        ],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: false, url: false }
          }
        ]
      },
      // Шрифты codicon из Monaco
      {
        test: /\.(ttf|woff2?)$/,
        include: /node_modules\/monaco-editor/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]'
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: { transpileOnly: true },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'json', 'html', 'css'],
      features: ['!gotoSymbol'],
      publicPath: ''
    }),
  ],
}