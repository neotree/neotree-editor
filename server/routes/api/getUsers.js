import { User } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  User.findAll({ where: payload })
    .then(users => done(null, { users }))
    .catch(done);
};
