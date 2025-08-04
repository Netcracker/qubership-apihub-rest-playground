const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  entry: {
    index: [
      './src/web-components/index.ts',
      'monaco-editor/dev/vs/editor/editor.main.css',
    ],
    styles: './src/web-components/monaco-styles.js' // точка входа только для CSS
  },
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
    filename: '[name].js',
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
      // CSS Monaco Editor: извлекаем в отдельный файл
      {
        test: /\.css$/,
        include: /node_modules\/monaco-editor/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
              url: true
            }
          }
        ]
      },
      // Шрифты codicon
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
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'json', 'html', 'css'],
      features: ['!gotoSymbol'],
      publicPath: ''
    }),
  ],
}
