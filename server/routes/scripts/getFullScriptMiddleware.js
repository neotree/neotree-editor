import { Script } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  Script.findOne({ where: payload })
    .then((script) => done(null, script))
    .catch(done);
};
