import { ApiKey } from '../../models';

module.exports = (app) => (req, res, next) => {
  const { apiKey } = req.body;

  const key = app.getRandomString();

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  (apiKey ?
    ApiKey.update({ key }, { where: { id: apiKey.id }, individualHooks: true })
    :
    ApiKey.create({ key })
  ).then(apiKey => done(null, { apiKey }))
  .catch(done);
};
