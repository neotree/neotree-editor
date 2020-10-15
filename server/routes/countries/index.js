import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/countries';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_COUNTRIES,
    require('./getCountriesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_COUNTRY,
    require('./getCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.ADD_COUNTRY,
    require('./addCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_COUNTRY,
    require('./updateCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_COUNTRIES,
    require('./updateCountriesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_COUNTRY,
    require('./deleteCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
