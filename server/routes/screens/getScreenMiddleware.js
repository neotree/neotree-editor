import { Screen } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { screenId } = req.query;

    const done = (err, screen) => {
      res.locals.setResponse(err, { screen });
      next();
    };

    let screen = null;
    try {
      screen = await Screen.findOne({ where: { screen_id: screenId } });
      if (screen) {
        const { data, ...s } = JSON.parse(JSON.stringify(screen));
        screen = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, screen);
  })();
};
