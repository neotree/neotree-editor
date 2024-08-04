import { Script as File } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  File.count({ where: { ...payload } })
    .then(filesCount => done(null, { filesCount }))
    .catch(done);
};
