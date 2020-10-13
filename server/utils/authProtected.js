import { UNAUTHORIZED } from '../../constants/error-codes/auth';

module.exports = protectedMiddleware => (req, res, next) => {
  if (req.isAuthenticated()) return protectedMiddleware(req, res, next);
  res.locals.setResponse(new Error(UNAUTHORIZED));
  next();
};
