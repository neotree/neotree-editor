import { ApiKey } from '../../models';

module.exports = app => (req, res, next) => {
  const key = req.headers['x-api-key'];

  const done = (e, apiKey) => {
    res.locals.setResponse(e, !apiKey ? null : { apiKey });
    if (e || !apiKey) {
      e = e || { msg: 'Invalid api key' };
      return app.responseMiddleware(req, res, next);
    }
    next();
  };

  if (!key) return done({ msg: 'Api key not provided' });

  ApiKey.findOne({ where: { key } })
    .then(apiKey => done(null, apiKey))
    .catch(done);
};
