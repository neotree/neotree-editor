import { App } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  App.findAll({ where: payload })
    .then(rows => done(null, { info: rows[0] }))
    .catch(done);
};
