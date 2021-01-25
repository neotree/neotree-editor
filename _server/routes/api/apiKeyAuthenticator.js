import { ApiKey } from '../../models';
import responseMiddleware from './responseMiddleware';

module.exports = () => (req, res, next) => {
  const key = req.headers['x-api-key'];

  const done = (e, apiKey) => {
    if (e || !apiKey) {
      e = e || { msg: 'Invalid api key' };
      res.locals.setResponse(e);
      return responseMiddleware(req, res, next);
    }
    res.locals.setResponse(null, { apiKey });
    next();
  };

  if (!key) return done({ msg: 'Api key not provided' });

  ApiKey.findOne({ where: { key } })
    .then(apiKey => done(null, apiKey))
    .catch(done);
};
