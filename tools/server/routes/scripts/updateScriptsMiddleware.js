import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const { scripts, returnUpdated } = req.body;

  const done = (err, payload) => {
    res.locals.setResponse(err, payload);
    next();
  };

  Promise.all(scripts.map(({ id, ...scr }) =>
    Script.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Script.findAll({ where: { id: scripts.map(scr => scr.id) } })
      .then(scripts => done(null, { scripts }))
      .catch(done);
  }).catch(done);
};
