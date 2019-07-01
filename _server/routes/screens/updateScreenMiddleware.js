import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next();
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Screen.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find screen with "id" ${id}.` });

      s.update(payload)
        .then(screen => done(null, screen))
        .catch(done);
    })
    .catch(done);
};
