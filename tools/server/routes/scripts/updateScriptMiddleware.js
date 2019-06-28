import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const { id, ...payload } = req.body; console.log(payload);

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next();
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.update(payload)
        .then(script => done(null, script))
        .catch(done);
    })
    .catch(done);
};
