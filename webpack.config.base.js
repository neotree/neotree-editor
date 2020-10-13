const path = require('path');

module.exports = {
  resolve: {
    symlinks: false,

    extensions: ['.ts', '.tsx', '.js'],

    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '.'),
      path.resolve(__dirname, 'src'),
    ],
    alias: [
      { name: '*', alias: path.resolve(__dirname, '.') },
      { name: '@', alias: path.resolve(__dirname, 'src') },
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: ['babel-loader']
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
        test: /\.(png|jpeg|jpg|gif|ico|woff|woff2|eot|otf|ttf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 5000000,
              name: '[path][name].[ext]?[hash]',
              outputPath: 'assets',
              publicPath: '/assets/'
            }
          }
        ]
      },
      {
        test: /\.svg/,
        use: [{ loader: 'svg-inline-loader' }]
      },
    ]
  }
};
