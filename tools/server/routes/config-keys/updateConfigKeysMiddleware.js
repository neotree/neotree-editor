import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const { configKeys, returnUpdated } = req.body;

  const done = (err, payload) => {
    res.locals.setResponse(err, payload);
    next();
  };

  Promise.all(configKeys.map(({ id, ...scr }) =>
    ConfigKey.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    ConfigKey.findAll({ where: { id: configKeys.map(scr => scr.id) } })
      .then(configKeys => done(null, { configKeys }))
      .catch(done);
  }).catch(done);
};
