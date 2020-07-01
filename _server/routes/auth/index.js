import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/check-email-registration',
    require('./checkEmailRegistrationMiddleware')(app),
    app.responseMiddleware
  );

  return router;
};
