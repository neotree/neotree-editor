import multer from 'multer';
import uuid from 'uuidv4';

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (router, app) => {
  const { responseMiddleware } = app;

  router.post(
    '/upload-file',
    upload.single('file'),
    (req, res, next) => {
      const f = req.file;
      const fileId = uuid();
      app.pool.query(
        'INSERT INTO files (id, filename, content_type, size, data, created_date, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [fileId, f.originalname, f.mimetype, f.size, f.buffer, new Date(), req.user ? req.user.id : null],
        err => {
          if (err) {
            res.locals.setResponse(err);
            return next();
          }

          app.pool.query(
            'SELECT id, uploaded_by, filename, content_type, size, created_date, modified_date from files WHERE "id"=$1',
            [fileId],
            (err, rslt) => {
              res.locals.setResponse(err, !rslt ? {} : { file: rslt.rows[0] });
              next();
            }
          );
        }
      );
    },
    responseMiddleware
  );

  return router;
};
