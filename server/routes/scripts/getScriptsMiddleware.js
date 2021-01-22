import { Script } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, scripts) => {
      res.locals.setResponse(err, { scripts });
      next();
    };

    let scripts = [];
    try {
      scripts = await Script.findAll({ where: { deletedAt: null }, order: [['position', 'ASC']], });
      scripts = scripts.map(script => {
        const { data, ...s } = JSON.parse(JSON.stringify(script));
        return { ...data, ...s };
      });
    } catch (e) { return done(e); }

    done(null, scripts);
  })();
};
