import express from 'express';
import { check } from 'express-validator/check';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-authenticated-user',
    require('./getAuthenticatedUserMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/check-email-registration',
    require('./checkEmailRegistrationMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/sign-in',
    require('./signInMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/sign-up',
    check('password', 'empty-password').not().isEmpty(),
    check('username', 'empty-username').not().isEmpty(),
    check('username', 'Email is not valid.').isEmail(),
    check('password', 'Password must have a minimum of 6 characters.')
      .isLength({ min: 6 }),
    require('./signUpMiddleware')(app),
    app.responseMiddleware
  );

  /******************************************************************************
  *****************************LOGOUT********************************************/
  router.get(
    '/logout',
    (req, res) => {
      req.logout();
      req.session.user = null;
      res.json({ authenticatedUser: null });
    }
  );

  return router;
};
