import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required configKey "id" is not provided.' });

  ConfigKey.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find configKey with "id" ${id}.` });

      s.update(payload)
        .then(configKey => done(null, configKey))
        .catch(done);

      return null;
    })
    .catch(done);
};
