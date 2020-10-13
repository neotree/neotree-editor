import express from 'express';

const router = express.Router();

module.exports = app => router
  .use(require('./auth')(app))
  .use(require('./data')(app))
  .use('/api', require('./api')(app))
  .use(require('./files')(app))
  .use(require('./users')(app))
  .use(require('./scripts')(app))
  .use(require('./screens')(app))
  .use(require('./diagnoses')(app))
  .use(require('./config-keys')(app))
  .use(require('./devices')(app));
