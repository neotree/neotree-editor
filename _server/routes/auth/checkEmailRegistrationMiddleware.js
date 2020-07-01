import { User } from '../../models';

module.exports = (app, payload, callback) => (req, res, next) => {
  const { email } = { ...(payload || req.query) };

  const done = callback || ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  User.findOne({ where: { email } })
    .catch(done)
    .then(u => done(
      u ? null : { msg: 'Email address not registered.' },
      !u ? null : { activated: u.password ? true : false, userId: u.id },
    ));
};
