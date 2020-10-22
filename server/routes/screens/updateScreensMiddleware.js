import { updateScreen } from './updateScreenMiddleware';

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { screens } = req.body;

    const done = (err, updatedScreens) => {
      if (!err) app.io.emit('update_screens', { key: app.getRandomString(), screens: screens.map(s => ({ screenId: s.screenId, scriptId: s.scriptId, })) });
      res.locals.setResponse(err, { updatedScreens });
      next();
    };

    let updatedScreens = [];
    try { updatedScreens = await Promise.all(screens.map(s => updateScreen(s))); } catch (e) { return done(e); }

    done(null, updatedScreens);
  })();
};
