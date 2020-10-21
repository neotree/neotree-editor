import express from 'express';
import { User } from '../../database';
import * as endpoints from '../../../constants/api-endpoints/users';

let router = express.Router(); //eslint-disable-line

module.exports = app => {
  router.get(
    '/get-users',
    (req, res, next) => {
      const done = (err, users = []) => {
        res.locals.setResponse(err, { users });
        next(); return null;
      };

      User.findAll({ attributes: ['id', 'email'] })
        .then(users => done(null, users))
        .catch(done);
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_USER,
    (req, res, next) => {
      const done = (err, rslt) => {
        res.locals.setResponse(err, { rslt });
        next(); return null;
      };

      Promise.all([
        User.destroy({ where: { id: req.body.id } }),
      ])
        .then(rslt => done(null, rslt))
        .catch(done);
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.ADD_USER,
    (req, res, next) => {
      (async () => {
        const done = (err, user) => {
          res.locals.setResponse(err, { user });
          next(); return null;
        };

        try {
          const user = await require('../../utils/addOrUpdateUser')(req.body);
          done(null, user);
        } catch (e) {
          done(e);
        }
      })();
    },
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.UPDATE_USER,
    require('./_updateUserMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.ADD_USER_HOSPITAL,
    require('./_addUserHospitalMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.UPDATE_USER_HOSPITAL,
    require('./_updateUserHospitalMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_USER_HOSPITALS,
    require('./_getUserHospitalsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.ADD_USER_COUNTRY,
    require('./_addUserCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.UPDATE_USER_COUNTRY,
    require('./_updateUserCountryMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_USER_COUNTRIES,
    require('./_getUserCountriesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
