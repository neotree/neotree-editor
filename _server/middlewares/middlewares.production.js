import compression from 'compression';

module.exports = app => {
  app.use(compression());
  return app;
};
