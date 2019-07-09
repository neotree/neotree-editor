import multer from 'multer';
import uuid from 'uuidv4';
import { ConfigKey } from '../../../models';
import handleScripts from './handleScripts';

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (router, app) => {
  const { responseMiddleware } = app;

  router.post(
    '/import-data',
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
      data.configKeys = data.configKeys || {};
      data.scripts = data.scripts || {};

      if (data.configKeys.map) {
        data.configKeys = data.configKeys.reduce((acc, current) => {
          acc[current.id] = current;
          return acc;
        }, {});
      }

      if (data.scripts.map) {
        data.scripts = data.scripts.reduce((acc, current) => {
          acc[current.id] = current;
          return acc;
        }, {});
      }

      const author = req.user ? req.user.id : null;

      const configKeys = Object.keys(data.configkeys || {}).map(key => {
        const { createdAt, updatedAt, configKeyId, ...configKey } = data.configkeys[key]; // eslint-disable-line
        return configKey;
      });

      const scripts = Object.keys(data.scripts || {}).map(key => {
        const { createdAt, updatedAt, scriptId, ...script } = data.scripts[key];  // eslint-disable-line
        const screens = script.screens || (data.screens[key] || {});
        const diagnoses = script.diagnoses || (data.diagnosis[key] || {});
        return {
          ...script,
          screens: script.screens || Object.keys(screens || {}).map(key => screens[key]),
          diagnoses: script.diagnoses || Object.keys(diagnoses || {}).map(key => diagnoses[key])
        };
      });

      configKeys.forEach(configKey => {
        ConfigKey.create({
          id: uuid(),
          author,
          data: JSON.stringify(configKey.data || configKey)
        })
          .then(() => null)
          .catch(err => console.log(configKey, err));
      });

      handleScripts(app, { scripts, author }, done);

      if ((configKeys.length === 0) && (scripts.length === 0)) done();
    },
    responseMiddleware
  );

  return router;
};
