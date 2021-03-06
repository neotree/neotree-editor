import { User } from '../../database';

module.exports = (app, payload, callback) => (req, res, next) => {
  const done = callback || ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  if (req.isAuthenticated()) {
    return User.findOne({ where: { email: req.user.email } })
      .then(u => {
        delete u.password;
        done(null, !u ? null : { authenticatedUser: u, });
      })
      .catch(done);
  }

  done(null, { authenticatedUser: null });
};
