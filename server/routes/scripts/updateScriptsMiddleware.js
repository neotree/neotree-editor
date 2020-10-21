import { updateScript } from './updateScriptMiddleware';

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { scripts } = req.body;

    const done = (err, payload) => {
      if (!err) app.io.emit('update_scripts', { key: app.getRandomString(), scripts: scripts.map(s => ({ id: s.id })) });
      res.locals.setResponse(err, payload);
      next();
    };

    const updatedScripts = [];
    try { await Promise.all(scripts.map(s => updateScript(s))); } catch (e) { return done(e); }

    done(null, updatedScripts);
  })();
};
