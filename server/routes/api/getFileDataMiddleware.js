import { File } from '../../database';

module.exports = () => (req, res, next) => {
  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  File.findAll({ where: { id: req.params.fileId, }, attributes: ['id', 'filename', 'content_type', 'size', 'metadata', 'data'], })
    .then(files => done(null, { file: files[0] || null, }))
    .catch(done);
};
