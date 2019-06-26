import path from 'path';
import multer from 'multer';

const upload = multer({ dest: path.resolve(__dirname, '../../tmp_uploads/') });

module.exports = (router, app) => {
  const { responseMiddleware } = app;

  router.post(
    '/upload-tmp-file',
    upload.single('file'),
    (req, res, next) => {
      res.locals.setResponse(null, { status: 'OK' });
      next();
    },
    responseMiddleware
  );

  return router;
};
