import { Hospital } from '../../database';

module.exports = app => (req, res, next) => {
  const { hospitals, returnUpdated } = req.body;

  const done = (err, payload) => {
    if (!err) app.io.emit('update_hospitals', { key: app.getRandomString(), hospitals: hospitals.map(c => ({ id: c.id })) });
    res.locals.setResponse(err, payload);
    next();
    return null;
  };

  Promise.all(hospitals.map(({ id, ...scr }) =>
    Hospital.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Hospital.findAll({ where: { id: hospitals.map(scr => scr.id) } })
      .then(hospitals => done(null, { hospitals }))
      .catch(done);

    return null;
  }).catch(done);
};
