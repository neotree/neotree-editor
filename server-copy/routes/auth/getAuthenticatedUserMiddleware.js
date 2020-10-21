import { User } from '../../database';

module.exports = (app, payload, callback) => (req, res, next) => {
  const done = callback || ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  if (req.isAuthenticated()) {
    return User.findOne({ where: { id: req.user.id } })
      .then(u => {
        const authenticatedUser = u ? JSON.parse(JSON.stringify(u)) : null;
        if (authenticatedUser) delete authenticatedUser.password;
        done(null, !u ? null : { authenticatedUser });
      })
      .catch(done);
  }

  done(null, { authenticatedUser: null });
};
