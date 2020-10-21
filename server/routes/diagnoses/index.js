import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/diagnoses';

const router = express.Router();

module.exports = app => {
  router.post(
    endpoints.COPY_DIAGNOSES,
    require('./copyDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

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

  router.get(
    endpoints.GET_FULL_DIAGNOSIS,
    require('./getFullDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    '/create-diagnosis',
    require('./createDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSIS,
    require('./updateDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSES,
    require('./updateDiagnosesMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_DIAGNOSES,
    require('./deleteDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_DIAGNOSES,
    require('./duplicateDiagnosesMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
