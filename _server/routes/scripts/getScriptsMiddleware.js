import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, scripts) => {
    res.locals.setResponse(err, { scripts });
    next();
  };

  Script.findAll({ where: payload })
    .then(scripts => done(null, scripts))
    .catch(done);
};
