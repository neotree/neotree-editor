import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Script.findAll({ where: { ...payload } })
    .then(scripts => done(null, { scripts }))
    .catch(done);
};
