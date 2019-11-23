const path = require('path');

module.exports = {
  resolve: {
    symlinks: false,

    modules: [
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, './_utils'),
      path.resolve(__dirname, './_config'),
      path.resolve(__dirname, './src'),
      path.resolve(__dirname, './src/_redux'),
      path.resolve(__dirname, './src/_utils'),
      path.resolve(__dirname, './src/ui'),
      path.resolve(__dirname, './src/App'),
      path.resolve(__dirname, './src/App/.hooks'),
      path.resolve(__dirname, './src/App/components'),
      path.resolve(__dirname, './src/App/Dashboard'),
      path.resolve(__dirname, './src/App/Dashboard/components')
    ],
    alias: {
      config: path.resolve(__dirname, '_config'),
      utils: path.resolve(__dirname, '_utils'),
      root: path.resolve(__dirname, 'src'),
      ui: path.resolve(__dirname, 'src/ui'),
      App: path.resolve(__dirname, 'src/App'),
      AppUtils: path.resolve(__dirname, 'src/_utils'),
      AppHooks: path.resolve(__dirname, 'src/App/.hooks'),
      AppComponents: path.resolve(__dirname, 'src/App/components'),
      Dashboard: path.resolve(__dirname, 'src/App/Dashboard'),
      DashboardComponents: path.resolve(__dirname, 'src/App/Dashboard/components')
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '_config'),
          path.resolve(__dirname, '_utils')
        ],
        use: [{ loader: 'babel-loader' }]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader: 'postcss-loader' }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' }, // creates style nodes from JS strings
          { loader: 'css-loader', options: { importLoaders: 1 } }, // translates CSS into CommonJS
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' } // compiles Sass to CSS
        ]
      },
      {
        test: /\.(png|jpeg|jpg|gif|woff|woff2|eot|svg|otf|ttf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 5000000,
              name: '[path][name].[ext]?[hash]',
              outputPath: 'assets',
              publicPath: '/assets'
            }
          }
        ]
      }
    ]
  }
};
