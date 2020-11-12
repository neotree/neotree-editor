import { Screen } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Screen.findOne({ where: { ...payload } })
    .then(screen => done(null, { screen }))
    .catch(done);
};
