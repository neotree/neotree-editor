import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const { screens, returnUpdated } = req.body;

  const done = (err, payload) => {
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  Promise.all(screens.map(({ id, ...scr }) =>
    Screen.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Screen.findAll({ where: { id: screens.map(scr => scr.id) }, order: [['position', 'ASC']] })
      .then(screens => done(null, { screens }))
      .catch(done);

    return null;
  }).catch(done);
};
