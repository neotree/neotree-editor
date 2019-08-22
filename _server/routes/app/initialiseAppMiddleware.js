import CustomMiddleware from '../../../_utils/CustomMiddleware';

module.exports = app => (req, res, next) => {
  const middleware = new CustomMiddleware();

  middleware.use(next =>
    require('./getAppMiddleware')(app)(req, res, next)
  );

  middleware.use(next =>
    require('../users/getAuthenticatedUserMiddleware')(app)(req, res, next)
  );

  if (req.user) {
    middleware.use(next =>
      require('../user-interfaces/getMyUIMiddleware')(app)(req, res, next)
    );
  }

  middleware.go(next);
};
