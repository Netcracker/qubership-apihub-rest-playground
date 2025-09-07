'use strict'
const { ProvidePlugin } = require('webpack')

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
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
  babel: async () => {
    return {
      presets: [
        '@babel/preset-react',
        '@babel/preset-typescript',
        [
          '@babel/preset-env',
          {
            targets: 'last 2 Chrome versions, last 2 Firefox versions, last 1 Safari version',
            modules: 'commonjs',
          },
        ],
      ],
    }
  },
  webpackFinal: config => {
    config.resolve.plugins = config.resolve.plugins || []
    config.resolve.plugins.push(new TsconfigPathsPlugin())

    config.resolve.fallback = {
      stream: false,
      path: false,
      process: false,
      tty: require.resolve('./tty-polyfill.js'),
      querystring: require.resolve('querystring-es3'),
    }

    // Provide global polyfills
    config.plugins.push(
      new ProvidePlugin({
        process: require.resolve('process/browser'),
      }),
    )

    // Add global define for tty module
    const webpack = require('webpack')
    config.plugins.push(
      new webpack.DefinePlugin({
        'global.tty': JSON.stringify({ isatty: () => false }),
        'window.tty': JSON.stringify({ isatty: () => false }),
      }),
    )

    config.resolve.conditionNames = ['require', 'default']

    // Filter out existing TypeScript/JavaScript rules and replace with our own
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.test) {
        const testStr = rule.test.toString()
        return !testStr.includes('tsx?') && !testStr.includes('jsx?') && !testStr.includes('ts|tsx')
          && !testStr.includes('js|jsx')
      }
      return true
    })

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

    config.plugins.push(
      new ProvidePlugin({
        process: require.resolve('process/browser'),
      }),
    )

    return config
  },
}
