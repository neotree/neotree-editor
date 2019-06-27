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

  return router;
};
