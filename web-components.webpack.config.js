const path = require("path");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: {
    index: [
      "./src/web-components/index.ts",
      "monaco-editor/dev/vs/editor/editor.main.css",
      "monaco-editor/min/vs/editor/editor.main.css"
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      stream: false,
      path: false,
      process: require.resolve("process/browser"),
      querystring: require.resolve("querystring-es3")
    }
  },
  devtool: "source-map",
  performance: {
    maxEntrypointSize: 2000000,
    maxAssetSize: 2000000
  },
  output: {
    filename: "[name].js",
    path: path.join(process.cwd(), "dist"),
    publicPath: "",
    globalObject: "this",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        resolve: { fullySpecified: false }
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, "node_modules/monaco-editor")
        ],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: false,
              import: true,
              url: false // Отключаем обработку url() для простоты
            }
          }
        ]
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        include: [
          path.resolve(__dirname, "node_modules/monaco-editor")
        ],
        type: "asset/inline"
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: { transpileOnly: true }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: require.resolve("process/browser")
    }),
    new MiniCssExtractPlugin({
      filename: "monaco-editor.css"
    }),
    new MonacoWebpackPlugin({
      // Указываем языки, которые используем
      languages: ["javascript", "typescript", "json", "css", "html"],
      // Встраиваем workers в основной бандл
      globalObject: "self"
    })
  ],
  externals: {
    "react": "react",
    "react-dom": "react-dom"
  }
};
