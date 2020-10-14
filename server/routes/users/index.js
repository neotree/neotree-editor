import express from 'express';
import { User } from '../../database';

let router = express.Router(); //eslint-disable-line

module.exports = () => {
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
    '/delete-user',
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
    '/add-user',
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

  return router;
};
