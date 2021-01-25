import { updateScript } from './updateScriptMiddleware';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scripts } = req.body;

    const done = (err, updatedScripts) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      res.locals.setResponse(null, { updatedScripts });
      next();
    };

    let updatedScripts = [];
    try { updatedScripts = await Promise.all(scripts.map(s => updateScript(s))); } catch (e) { return done(e); }

    done(null, updatedScripts);
  })();
};
