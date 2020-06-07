"use strict";

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  app.use(require('./app')(app));
  app.use('/api', require('./api')(app));
  app.use(require('./files')(app));
  app.use(require('./users')(app));
  app.use(require('./scripts')(app));
  app.use(require('./screens')(app));
  app.use(require('./diagnoses')(app));
  app.use(require('./config-keys')(app));
  app.use(require('./devices')(app));
  return app;
};