import { Hospital, Log } from '../../database';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, hospital) => {
    if (!err) {
      app.io.emit('delete_hospitals', { key: app.getRandomString(), hospitals: [{ id }] });
      Log.create({
        name: 'delete_hospitals',
        data: JSON.stringify({ hospitals: [{ id }] })
      });
    }
    res.locals.setResponse(err, { hospital });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required hospital "id" is not provided.' });

  Hospital.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find hospital with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};
