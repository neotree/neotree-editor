import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-diagnoses',
    require('./getDiagnosesMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-diagnosis',
    require('./getDiagnosisMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/create-diagnosis',
    require('./createDiagnosisMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-diagnosis',
    require('./updateDiagnosisMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-diagnoses',
    require('./updateDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/delete-diagnoses',
    require('./deleteDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/duplicate-diagnoses',
    require('./duplicateDiagnosesMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/copy-diagnoses',
    require('./copyDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  return router;
};
