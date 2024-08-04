import { File } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  File.findAll({ where: { ...payload }, attributes: ['id', 'filename', 'content_type', 'size', 'metadata'], })
    .then(files => done(null, { files }))
    .catch(done);
};
