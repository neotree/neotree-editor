import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/diagnoses';

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
    require('./createDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSIS,
    require('./updateDiagnosisMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_DIAGNOSES,
    require('./updateDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_DIAGNOSES,
    require('./deleteDiagnosesMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_DIAGNOSES,
    require('./duplicateDiagnosesMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.COPY_DIAGNOSES,
    require('./copyDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
