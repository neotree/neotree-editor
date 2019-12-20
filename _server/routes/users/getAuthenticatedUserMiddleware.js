import { User, UserProfile } from '../../models';

module.exports = app => (req, res, next) => { // eslint-disable-line
  const done = (err, user) => {
    res.locals.setResponse(err, { authenticatedUser: user });
    next(); return null;
  };
  if (req.isAuthenticated()) {
    return Promise.all([
      User.findOne({ where: { id: req.user.id } }),
      UserProfile.findOne({ where: { user_id: req.user.id } })
    ])
      .then(([user, profile]) => done(null, !profile ? null : {
        role: user ? user.role : 0,
        ...JSON.parse(JSON.stringify(profile))
      }))
      .catch(done);
  }
  done(null, null);
};
