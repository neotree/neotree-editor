import multer from 'multer';
import seedData from './seedData';

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (router, app) => {
  const { responseMiddleware } = app;

  router.post(
    '/import-from-firebase',
    upload.single('file'),
    (req, res, next) => {
      seedData(app, req, (err, rslt) => {
        console.log(err, rslt);
        res.locals.setResponse(null, {
          data_import_info: {
            date: new Date(),
            imported_by: (req.user || {}).id || null
          }
        });
        next();
      });
    },
    responseMiddleware
  );

  return router;
};
