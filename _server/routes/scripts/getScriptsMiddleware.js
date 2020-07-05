import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (err, scripts) => {
    res.locals.setResponse(err, { scripts });
    next(); return null;
  };

  Script.findAll({ where: payload, order: [['position', 'ASC']] })
    .then(scripts => done(null, scripts))
    .catch(done);
};
