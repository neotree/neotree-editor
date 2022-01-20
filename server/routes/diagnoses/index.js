import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/diagnoses';
import { createDiagnosisMiddleware } from './createDiagnosisMiddleware';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_DIAGNOSES,
    require('./getDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_DIAGNOSIS,
    require('./getDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.CREATE_DIAGNOSIS,
    createDiagnosisMiddleware(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSIS,
    require('./updateDiagnosisMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSES,
    require('./updateDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_DIAGNOSES,
    require('./deleteDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_DIAGNOSES,
    require('./duplicateDiagnosesMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.COPY_DIAGNOSES,
    require('./copyDiagnosesMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  return router;
};
