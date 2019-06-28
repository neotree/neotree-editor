import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const { screens, returnUpdated } = req.body;

  const done = (err, rslts) => {
    res.locals.setResponse(err, { rslts });
    next();
  };

  Promise.all(screens.map(({ id, ...scr }) =>
    Screen.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, rslts);

    Screen.findAll({ where: { id: screens.map(scr => scr.id) } });
  }).catch(done);
};
