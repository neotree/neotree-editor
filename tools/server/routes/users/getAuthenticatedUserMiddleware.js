import { UserProfile } from '../../models';

module.exports = app => (req, res, next) => { // eslint-disable-line
  if (req.isAuthenticated()) {
    const done = (err, user) => {
      res.locals.setResponse(err, { authenticatedUser: user });
      next();
    };

    UserProfile.findOne({ where: { user_id: req.user.id } })
      .then(user => done(null, user)).catch(done);
  }
  res.locals.setResponse(null, { authenticatedUser: null });
  next();
};
