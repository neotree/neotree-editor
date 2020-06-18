import { Log } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (err, logs) => {
    res.locals.setResponse(err, { logs });
    next(); return null;
  };

  Log.findAll({ where: payload })
    .then(logs => done(null, logs))
    .catch(done);
};
