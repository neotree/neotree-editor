import { Log } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (err, log) => {
    res.locals.setResponse(err, { log });
    next(); return null;
  };

  Log.findOne({ where: payload })
    .then((log) => done(null, log))
    .catch(done);
};
