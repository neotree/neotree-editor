import { UserInterface } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = res.locals.createUIParams || req.body;
  const user = req.user ? req.user.id : null;

  if (!user) return done({ msg: 'Required user "id" is not provided.' });

  const done = (err, ui) => {
    res.locals.setResponse(err, { ui });
    next(); return null;
  };

  UserInterface.findOne({ where: { user } })
    .catch(done)
    .then(ui => {
      if (ui) return done(null, ui);

      UserInterface.create({ ...payload, user })
        .then((ui) => done(null, ui))
        .catch(done);

      return null;
    });
};
