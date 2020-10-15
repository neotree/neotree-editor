import { Country, Log } from '../../database';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, country) => {
    if (!err) {
      app.io.emit('delete_countries', { key: app.getRandomString(), countries: [{ id }] });
      Log.create({
        name: 'delete_countries',
        data: JSON.stringify({ countries: [{ id }] })
      });
    }
    res.locals.setResponse(err, { country });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required country "id" is not provided.' });

  Country.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find country with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};
