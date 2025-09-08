'use strict'
const { ProvidePlugin } = require('webpack')

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  stories: ['../src/**/*.stories.{js,jsx,ts,tsx}'],
  addons: ['@storybook/addon-docs', {
    name: '@storybook/addon-postcss',
    options: {
      postcssLoaderOptions: { implementation: require('postcss') },
    },
  }],

  webpackFinal: config => {
    config.resolve.plugins = config.resolve.plugins || []
    config.resolve.plugins.push(new TsconfigPathsPlugin())

    config.resolve.fallback = {
      stream: false,
      path: false,
      process: false,
      tty: false,
      querystring: require.resolve('querystring-es3'),
    }

    // Provide global polyfills
    config.plugins.push(
      new ProvidePlugin({
        process: require.resolve('process/browser'),
      }),
    )

    // Add our comprehensive TypeScript and JavaScript handling
    config.module.rules.unshift(
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: 'last 2 Chrome versions, last 2 Firefox versions, last 1 Safari version',
                  modules: false,
                }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                ['@babel/preset-typescript', { allowNamespaces: true }],
              ],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: 'last 2 Chrome versions, last 2 Firefox versions, last 1 Safari version',
                  modules: false,
                }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.ya?ml$/,
        type: 'asset/source',
      },
    )

    return config
  },
}
