import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  Script.findOne({ where: payload })
    .then((script) => done(null, script))
    .catch(done);
};
