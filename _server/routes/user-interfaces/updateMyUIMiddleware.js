import { UserInterface } from '../../models';

module.exports = app => (req, res, next) => {
  const payload = res.locals.updateUIParams || req.body;
  const user = req.user ? req.user.id : null;

  const done = (err, ui) => {
    res.locals.setResponse(err, { ui });
    next(); return null;
  };

  if (!user) return done({ msg: 'Required user "id" is not provided.' });

  UserInterface.findOne({ where: { user } })
    .then(s => {
      if (!s) {
        res.locals.createUIParams = { ...payload, user };
        require('./createMyUIMiddleware')(app)(req, res, done);
        return null;
      }

      s.update(payload)
        .then(ui => done(null, ui))
        .catch(done);

      return null;
    })
    .catch(done);
};
