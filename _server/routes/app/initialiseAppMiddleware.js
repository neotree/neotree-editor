import CustomMiddleware from '../../../_utils/CustomMiddleware';

module.exports = app => (req, res, next) => {
  const middleware = new CustomMiddleware();

  middleware.use(next =>
    require('./getAppMiddleware')(app)(req, res, next)
  );

  middleware.use(next =>
    require('../users/getAuthenticatedUserMiddleware')(app)(req, res, next)
  );

  middleware.go(next);
};
