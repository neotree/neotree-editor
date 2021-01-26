import multer from 'multer';
import { uuid } from 'uuidv4';
import { File } from '../../database';
import * as endpoints from '../../../constants/api-endpoints/files';

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (router) => {
  router.post(
    endpoints.UPLOAD_FILE,
    upload.single('file'),
    (req, res, next) => {
      const f = req.file;

      const done = (err, file) => {
        res.locals.setResponse(err, { file });
        next(); return null;
      };

      File.create({
        id: uuid(),
        filename: f.originalname,
        content_type: f.mimetype,
        size: f.size,
        data: f.buffer,
        uploaded_by: req.user ? req.user.id : null
      }).then((rslts) => {
        done(null, !rslts ? null : {
          id: rslts.id,
          filename: rslts.filename,
          content_type: rslts.content_type,
          size: rslts.size,
          createdAt: rslts.createdAt,
          updatedAt: rslts.updatedAt,
        });
      })
      .catch(done);
    },
    require('../../utils/responseMiddleware')
  );

  return router;
};
