import express from 'express';
import { check } from 'express-validator/check';
import { User } from '../../models';

let router = express.Router(); //eslint-disable-line

module.exports = app => {
  const { responseMiddleware } = app;

  router.post(
    '/lookup-username',
    (req, res, next) => {
      const done = (err, rslt) => {
        res.locals.setResponse(err, rslt);
        next(); return null;
      };

      User.findOne({ where: { email: req.body.username } })
        .then(user => done(null, {
          usernameIsRegistered: user ? true : false,
          userIsActive: user && user.password ? true : false
        }))
        .catch(done);
    },
    responseMiddleware
  );

  router.post(
    '/sign-in',
    require('./signInMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/sign-up',
    check('password', 'empty-password').not().isEmpty(),
    check('username', 'empty-username').not().isEmpty(),
    check('username', 'Username must be a valid email.').isEmail(),
    check('password', 'Password must have a minimum of 6 characters.')
      .isLength({ min: 6 }),
    require('./signUpMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-authenticated-user',
    require('./getAuthenticatedUserMiddleware')(app),
    responseMiddleware
  );

  /******************************************************************************
  *****************************LOGOUT********************************************/
  router.get(
    '/logout',
    (req, res) => {
      req.logout();
      req.session.user = null;
      res.json({ payload: { authenticatedUser: null } });
    }
  );

  return router;
};
