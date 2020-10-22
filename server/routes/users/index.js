import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/users';

let router = express.Router(); //eslint-disable-line

module.exports = app => {
  router.get(
    endpoints.GET_USERS,
    require('./_getUsersMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_USERS,
    require('./_deleteUsersMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.ADD_USER,
    require('./_addUserMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_USER,
    require('./_updateUserMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
