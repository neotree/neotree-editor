import { validationResult } from 'express-validator/check';
import addOrUpdateUser from '../users/addOrUpdateUser';

module.exports = (app, payload, callback) => (req, res, next) => {
  const {
    loginOnSignUp,
    password2, // eslint-disable-line
    ...params
  } = { ...(payload || req.body) };

  const done = callback || ((err, rslts) => {
    res.locals.setResponse(err, rslts);
    next(); return null;
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) done(errors.array());

  addOrUpdateUser(params)
    .then(({ user, profile }) => {
      if (!user) return done({ msg: 'Something went wrong' });

      if (loginOnSignUp === false) return done(null, user);

      req.logIn(user, err => {
        if (err) done(err);

        done(null, { user: profile || user });
      });
    }).catch(done);
};
