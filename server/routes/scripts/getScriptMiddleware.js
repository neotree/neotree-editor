import { Script } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId } = req.query;

    const done = (err, script) => {
      res.locals.setResponse(err, { script });
      next();
    };

    let script = null;
    try {
      script = await Script.findOne({ where: { script_id: scriptId } });
      if (script) {
        const { data, ...s } = JSON.parse(JSON.stringify(script));
        script = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, script);
  })();
};
