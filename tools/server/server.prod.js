import express from 'express';
import path from 'path';
// import serveFavicon from 'serve-favicon';
import compression from 'compression';
import dbConfig from '../../_config/database.production.json';
import setAppMiddlewares from './setAppMiddlewares';

let app = express();

app = setAppMiddlewares(app, { dbConfig });

// favicon
// app.use(serveFavicon(path.resolve(__dirname, '../dist/favicon.ico')));

app.use(compression());

app.use(express.static(path.resolve(__dirname, '../../src')));

app = require('./routes')(app);

app.get('*',
  (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../src/index.html'));
  }
);
