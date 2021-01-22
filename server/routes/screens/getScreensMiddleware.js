import { Screen } from '../../database';

module.exports = () => (req, res, next) => {
  const { scriptId } = req.query;

  (async () => {
    const done = (err, screens) => {
      res.locals.setResponse(err, { screens });
      next();
    };

    let screens = [];
    try {
      screens = await Screen.findAll({ where: { script_id: scriptId, deletedAt: null }, order: [['position', 'ASC']], });
      screens = screens.map(screen => {
        const { data, ...s } = JSON.parse(JSON.stringify(screen));
        return { ...data, ...s };
      });
    } catch (e) { return done(e); }

    done(null, screens);
  })();
};
