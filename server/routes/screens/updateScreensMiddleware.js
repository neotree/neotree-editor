import { updateScreen } from './updateScreenMiddleware';

module.exports = () => (req, res, next) => {
  (async () => {
    const { screens } = req.body;

    const done = (err, updatedScreens) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      res.locals.setResponse(null, { updatedScreens });
      next();
    };

    let updatedScreens = [];
    try { updatedScreens = await Promise.all(screens.map(s => updateScreen(s))); } catch (e) { return done(e); }

    done(null, updatedScreens);
  })();
};
