import { UserInterface } from '../../models';

module.exports = app => (req, res, next) => {
  const user = req.user ? req.user.id : null;

  const done = (err, ui) => {
    res.locals.setResponse(err, { ui });
    next(); return null;
  };

  UserInterface.findOne({ where: { user } })
    .then((ui) => {
      if (!ui) {
        res.locals.createUIParams = { user, options: {} };
        require('./createMyUIMiddleware')(app)(req, res, done);
        return null;
      }

      return done(null, ui);
    })
    .catch(done);
};
