import { Log, Script } from '../../models';

module.exports = (app) => (req, res, next) => {
  const { scripts, returnUpdated } = req.body;

  const done = (err, payload) => {
    if (!err) {
      app.io.emit('update_scripts', { scripts: scripts.map(s => ({ scriptId: s.id })) });
      Log.create({
        name: 'update_scripts',
        data: JSON.stringify({ scripts: scripts.map(s => ({ scriptId: s.id })) })
      });
    }
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  Promise.all(scripts.map(({ id, ...scr }) =>
    Script.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Script.findAll({ where: { id: scripts.map(scr => scr.id) } })
      .then(scripts => done(null, { scripts }))
      .catch(done);

    return null;
  }).catch(done);
};