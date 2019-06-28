import { validationResult } from 'express-validator/check';
import { User } from '../../models';

module.exports = app => (req, res, next) => { //eslint-disable-line
  const {
    loginOnSignUp,
    password2, // eslint-disable-line
    ...params
  } = res.locals.signUpPayload || req.body;

  const done = (err, user) => {
    res.locals.setResponse(err, { user });
    next();
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) done(errors.array());

  User.add(params)
    .then(({ user, profile }) => {
      if (!user) return done({ msg: 'Something went wrong' });

      if (loginOnSignUp === false) return done(null, user);

      req.logIn(user, err => {
        if (err) done(err);

        done(null, profile || user);
      });
    }).catch(done);
};
