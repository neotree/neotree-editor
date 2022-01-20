import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/scripts';
import { Screen } from '../../database';
import { importScripts, getImportScripts } from './importScripts';
import { createScriptMiddleware } from './createScriptMiddleware';

const router = express.Router();

module.exports = app => {
  router.post(
    '/import-scripts', 
    importScripts(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware'),
  );

  router.get(
    '/get-import-scripts', 
    getImportScripts(app),
    require('../../utils/responseMiddleware'),
  );

  router.get(
    endpoints.GET_SCRIPT_DIAGNOSES_SCREENS,
    (req, res) => {
      const { script_id } = req.query;
      (async () => {
          try {
            const count = await Screen.count({ where: { type: 'diagnosis', script_id, deletedAt: null, } });
            res.json({ count, });
          } catch(e) { res.json({ error: e.message }); }
      })();
    },
  );

  router.get(
    endpoints.GET_SCRIPTS,
    require('./getScriptsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_SCRIPT,
    require('./getScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_SCRIPT_ITEMS,
    require('./getScriptItemsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.CREATE_SCRIPT,
    createScriptMiddleware(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCRIPT,
    require('./updateScriptMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCRIPTS,
    require('./updateScriptsMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_SCRIPTS,
    require('./deleteScriptsMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_SCRIPTS,
    require('./duplicateScriptsMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  return router;
};
