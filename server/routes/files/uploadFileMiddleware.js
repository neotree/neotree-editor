import multer from 'multer';
import uuid from 'uuidv4';
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
      const fileId = uuid();

      const done = (err, file) => {
        res.locals.setResponse(err, { file });
        next(); return null;
      };

      File.create({
        id: fileId,
        filename: f.originalname,
        content_type: f.mimetype,
        size: f.size,
        data: f.buffer,
        uploaded_by: req.user ? req.user.id : null
      }).then(() => {
        File.findOne({
          where: { id: fileId },
          attributes: ['id', 'filename', 'content_type', 'size', 'createdAt', 'updatedAt']
        }).then(f => done(null, f))
          .catch(done);
      })
      .catch(done);
    },
    require('../../utils/responseMiddleware')
  );

  return router;
};
