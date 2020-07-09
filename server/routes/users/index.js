import express from 'express';
import { User, UserProfile } from '../../models';

let router = express.Router(); //eslint-disable-line

module.exports = app => {
  const { responseMiddleware } = app;

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
    responseMiddleware
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
        UserProfile.destroy({ where: { user_id: req.body.id } })
      ])
        .then(rslt => done(null, rslt))
        .catch(done);
    },
    responseMiddleware
  );

  router.post(
    '/add-user',
    (req, res, next) => {
      const done = (err, user) => {
        res.locals.setResponse(err, { user });
        next(); return null;
      };

      User.create({ ...req.body })
        .then(user => done(null, user))
        .catch(done);
    },
    responseMiddleware
  );

  return router;
};
