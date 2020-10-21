import express from 'express';
import { check, validationResult } from 'express-validator/check';
import * as endpoints from '../../../constants/api-endpoints/auth';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_AUTHENTICATED_USER,
    require('./getAuthenticatedUserMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.CHECK_EMAIL_REGISTRATION,
    require('./checkEmailRegistrationMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.SIGN_IN,
    require('./signInMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.SIGN_UP,
    check('password', 'empty-password').not().isEmpty(),
    check('username', 'empty-username').not().isEmpty(),
    check('username', 'Email is not valid.').isEmail(),
    check('password', 'Password must have a minimum of 6 characters.')
      .isLength({ min: 6 }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.locals.setResponse(errors.array());
        next();
      } else {
        require('./signUpMiddleware')(app)(req, res, next);
      }
    },
    require('../../utils/responseMiddleware')
  );

  /******************************************************************************
  *****************************LOGOUT********************************************/
  router.get(
    endpoints.SIGN_OUT,
    (req, res) => {
      req.logout();
      req.session.user = null;
      res.json({ authenticatedUser: null });
    }
  );

  return router;
};
