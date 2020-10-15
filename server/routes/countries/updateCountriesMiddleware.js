import { Country } from '../../database';

module.exports = app => (req, res, next) => {
  const { countries, returnUpdated } = req.body;

  const done = (err, payload) => {
    if (!err) app.io.emit('update_countries', { key: app.getRandomString(), countries: countries.map(c => ({ id: c.id })) });
    res.locals.setResponse(err, payload);
    next();
    return null;
  };

  Promise.all(countries.map(({ id, ...scr }) =>
    Country.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Country.findAll({ where: { id: countries.map(scr => scr.id) } })
      .then(countries => done(null, { countries }))
      .catch(done);

    return null;
  }).catch(done);
};
