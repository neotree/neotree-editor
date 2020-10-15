import { Hospital } from '../../database';

module.exports = app => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, hospital) => {
    if (!err) app.io.emit('update_hospitals', { key: app.getRandomString(), hospitals: [{ id }] });
    res.locals.setResponse(err, { hospital });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required hospital "id" is not provided.' });

  Hospital.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
