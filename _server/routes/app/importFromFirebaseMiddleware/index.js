import multer from 'multer';
import { ConfigKey } from '../../../models';
import handleScripts from './handleScripts';

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (router, app) => {
  const { responseMiddleware } = app;

  router.post(
    '/import-from-firebase',
    upload.single('file'),
    (req, res, next) => {
      const done = (err) => {
        res.locals.setResponse(err, err ? {} : {
          data_import_info: {
            date: new Date(),
            imported_by: (req.user || {}).id || null
          }
        });
        next(); return null;
      };

      const data = JSON.parse(req.file.buffer);
      const author = req.user ? req.user.id : null;

      const configKeys = Object.keys(data.configkeys).map(key => {
        const { createdAt, updatedAt, configKeyId, ...configKey } = data.configkeys[key]; // eslint-disable-line
        return configKey;
      });

      const scripts = Object.keys(data.scripts).map(key => {
        const { createdAt, updatedAt, scriptId, ...script } = data.scripts[key];  // eslint-disable-line
        const screens = data.screens[key] || {};
        const diagnoses = data.diagnosis[key] || {};
        return {
          ...script,
          screens: Object.keys(screens).map(key => screens[key]),
          diagnoses: Object.keys(diagnoses).map(key => diagnoses[key])
        };
      });

      configKeys.forEach(configKey => {
        ConfigKey.create({ author, data: JSON.stringify(configKey) })
          .then(() => null)
          .catch(err => console.log(configKey, err));
      });

      handleScripts(app, { scripts, author }, done);
    },
    responseMiddleware
  );

  return router;
};
