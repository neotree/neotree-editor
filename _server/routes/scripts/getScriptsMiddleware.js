import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, scripts) => {
    res.locals.setResponse(err, { scripts });
    next(); return null;
  };

  Script.findAll({ where: payload, order: [['position', 'ASC']] })
    .then(scripts => done(null, scripts))
    .catch(done);
};
