import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/hospitals';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_HOSPITALS,
    require('./getHospitalsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_HOSPITAL,
    require('./getHospitalMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.ADD_HOSPITAL,
    require('./addHospitalMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_HOSPITAL,
    require('./updateHospitalMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_HOSPITALS,
    require('./updateHospitalsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_HOSPITALS,
    require('./deleteHospitalsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
