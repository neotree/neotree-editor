import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-authenticated-user',
    require('./getAuthenticatedUser')(app),
    app.responseMiddleware
  );

  router.get(
    '/check-email-registration',
    require('./checkEmailRegistration')(app),
    app.responseMiddleware
  );

  return router;
};
