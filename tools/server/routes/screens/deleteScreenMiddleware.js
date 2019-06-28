import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const { id } = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next();
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Screen.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);
    })
    .catch(done);
};
