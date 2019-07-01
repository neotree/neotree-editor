import { UserProfile } from '../../models';

module.exports = app => (req, res, next) => { // eslint-disable-line
  const done = (err, user) => {
    res.locals.setResponse(err, { authenticatedUser: user });
    next();
  };
  if (req.isAuthenticated()) {
    return UserProfile.findOne({ where: { user_id: req.user.id } })
      .then(user => done(null, user)).catch(done);
  }
  done(null, null);
};
