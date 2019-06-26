module.exports = app => {
  app.use(require('./app')(app));
  app.use(require('./files')(app));
  app.use(require('./users')(app));
  return app;
};
