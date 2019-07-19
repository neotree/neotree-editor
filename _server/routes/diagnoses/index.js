import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-diagnoses',
    require('./getDiagnosesMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-diagnosis',
    require('./getDiagnosisMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-full-diagnosis',
    require('./getFullDiagnosisMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/create-diagnosis',
    require('./createDiagnosisMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-diagnosis',
    require('./updateDiagnosisMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-diagnoses',
    require('./updateDiagnosesMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/delete-diagnosis',
    require('./deleteDiagnosisMiddleware')(app),
    responseMiddleware
  );

  return router;
};
