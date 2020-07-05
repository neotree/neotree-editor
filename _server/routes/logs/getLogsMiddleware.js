import { Log } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, logs) => {
    res.locals.setResponse(err, { logs });
    next(); return null;
  };

  Log.findAll({ where: payload })
    .then(logs => done(null, logs))
    .catch(done);
};
