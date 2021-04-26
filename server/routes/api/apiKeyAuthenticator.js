import { ApiKey } from '../../database';

module.exports = () => (req, res, next) => {
  const key = req.headers['x-api-key'] || (req.query || {}).apiKey || (req.body || {}).apiKey;

  const done = (e, apiKey) => {
    res.locals.setResponse(e, !apiKey ? null : { apiKey });
    if (e || !apiKey) {
      e = e || new Error('Invalid api key');
      return require('../../utils/responseMiddleware')(req, res, next);
    }
    next();
  };

  if (!key) return done(new Error('Api key not provided'));

  ApiKey.findOne({ where: { key } })
    .then(apiKey => done(null, apiKey))
    .catch(done);
};
