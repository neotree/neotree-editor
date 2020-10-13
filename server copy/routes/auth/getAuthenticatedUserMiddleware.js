import { User, UserProfile } from '../../models';

module.exports = (app, payload, callback) => (req, res, next) => {
  const done = callback || ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  if (req.isAuthenticated()) {
    return Promise.all([
      User.findOne({ where: { id: req.user.id } }),
      UserProfile.findOne({ where: { user_id: req.user.id } })
    ])
      .then(([user, profile]) => done(null, !profile ? null : {
        authenticatedUser: {
          role: user ? user.role : 0,
          ...JSON.parse(JSON.stringify(profile)),
        },
      }))
      .catch(done);
  }

  done(null, { authenticatedUser: null });
};
