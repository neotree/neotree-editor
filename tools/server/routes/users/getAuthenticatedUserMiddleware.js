import User from '../../models/User';

module.exports = app => (req, res, next) => { // eslint-disable-line
  if (req.isAuthenticated()) {
    return User.findOne({ _id: req.user._id })
      .select('_id profile')
      .populate({ path: 'profile' })
      .exec((error, user) => {
        res.locals.setResponse(error, {
          authenticatedUser: user.profile
        });
        next();
      });
  }
  res.locals.setResponse(null, { authenticatedUser: null });
  next();
};
