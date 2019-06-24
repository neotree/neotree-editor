import { validationResult } from 'express-validator/check';
import User from '../../models/User';

module.exports = app => (req, res, next) => { //eslint-disable-line
  const {
    loginOnSignUp,
    password2, // eslint-disable-line
    ...params
  } = res.locals.signUpPayload || req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.setResponse(errors.array());
    return next();
  }

  User.add(
    params,
    (err, user, userProfile) => {
      //if something went wrong creating user
      if (err) {
        res.locals.setResponse(err);
        return next();
      }

      if (!user) {
        res.locals.setResponse({ msg: 'Something went wrong' });
        return next();
      }

      if (loginOnSignUp === false) {
        res.locals.setResponse(null, { user });
        return next();
      }

      req.logIn(user, err => {
        if (err) {
          res.locals.setResponse(err);
          return next();
        }

        res.locals.setResponse(null, { user: userProfile || user });
        next();
      });
    }
  );
};
