import express from 'express';
import { check } from 'express-validator/check';

let router = express.Router(); //eslint-disable-line

module.exports = app => {
  const { responseMiddleware } = app;

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
  router.post(
    '/logout',
    (req, res) => {
      req.logout();
      req.session.user = null;
      res.json({ payload: { authenticatedUser: null } });
    }
  );

  return router;
};
