import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Screen.findOne({ where: { ...payload } })
    .then(screen => done(null, { screen }))
    .catch(done);
};
