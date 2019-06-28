import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const { scripts, returnUpdated } = req.body;

  const done = (err, rslts) => {
    res.locals.setResponse(err, { rslts });
    next();
  };

  Promise.all(scripts.map(({ id, ...scr }) =>
    Script.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, rslts);

    Script.findAll({ where: { id: scripts.map(scr => scr.id) } });
  }).catch(done);
};
