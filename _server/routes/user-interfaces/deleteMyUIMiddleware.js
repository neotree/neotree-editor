import { UserInterface } from '../../models';

module.exports = () => (req, res, next) => {
  const user = req.user ? req.user.id : null;

  const done = (err, ui) => {
    res.locals.setResponse(err, { ui });
    next(); return null;
  };

  if (!user) return done({ msg: 'Required user "id" is not provided.' });

  UserInterface.findOne({ where: { user } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "user" ${user}.` });

      s.destroy({ where: { user } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};
