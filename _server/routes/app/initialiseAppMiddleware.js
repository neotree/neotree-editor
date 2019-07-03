import getAppMiddleware from './getAppMiddleware';
import getAuthenticatedUserMiddleware from '../users/getAuthenticatedUserMiddleware';

module.exports = app => (req, res, next) => {
  getAppMiddleware(app)(req, res, () => {
    getAuthenticatedUserMiddleware(app)(req, res, () => {
      next(); return null;
    });
  });
};
