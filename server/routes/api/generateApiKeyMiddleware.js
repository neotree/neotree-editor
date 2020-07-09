import { ApiKey } from '../../models';

module.exports = () => (req, res, next) => {
  const { apiKey } = req.body;
  const getRandString = () => Math.random().toString(36).substring(2).toUpperCase();

  const key = `${getRandString()}${getRandString()}${getRandString()}`;

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
