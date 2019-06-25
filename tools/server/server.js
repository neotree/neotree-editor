import express from 'express';
import path from 'path';
// import serveFavicon from 'serve-favicon';
import webpack from 'webpack'; // eslint-disable-line
import webpackDevMiddleware from 'webpack-dev-middleware'; // eslint-disable-line
import webpackHotMiddleware from 'webpack-hot-middleware'; // eslint-disable-line
import webpackConfig from '../../webpack.config.dev';
import dbConfig from '../../_config/database.development.json';
import setAppMiddlewares from './setAppMiddlewares';

let app = express();

app = setAppMiddlewares(app, { dbConfig });

// favicon
// app.use(serveFavicon(path.resolve(__dirname, '../src/favicon.ico')));

//webpack
const compiler = webpack(webpackConfig, (...args) => console.log('webpack', ...args));
app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use(express.static(path.resolve(__dirname, '../../src')));

app = require('./routes')(app);

app.get('*',
  (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../src/index.html'));
  }
);
