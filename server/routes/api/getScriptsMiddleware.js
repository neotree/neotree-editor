import { Script } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Script.findAll({ order: [['position', 'ASC']], where: { ...payload } })
    .then(scripts => done(null, { scripts }))
    .catch(done);
};
