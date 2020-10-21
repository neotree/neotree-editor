import { ApiKey } from '../../database';

module.exports = () => (req, res, next) => {
  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  ApiKey.findOne({ where: {} })
    .then(apiKey => done(null, { apiKey }))
    .catch(done);
};
