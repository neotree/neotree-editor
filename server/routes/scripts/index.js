import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/scripts';
import { Screen, Script } from '../../database';
import { importScripts, getImportScripts } from './importScripts';
import { createScriptMiddleware } from './createScriptMiddleware';

const router = express.Router();

module.exports = app => {
    router.get('/script-labels', (req, res) => {
        (async () => {
            try {
                const scriptIds = `${req.query.scriptId || ''}`.split(',');
                const data = {};

                for (const scriptId of scriptIds) {
                    data[scriptId] = [];
                    const res = await Screen.findAll({ where: { script_id: scriptId, deletedAt: null }, order: [['position', 'ASC']], });
                    const screens = res.map(screen => {
                        const { data, ...s } = JSON.parse(JSON.stringify(screen));
                        return { ...data, ...s, };
                    });
                    
                    screens.forEach(s => {
                        const metadata = s.metadata || {};
                        const items = (metadata.items || []);
                        const fields = (metadata.fields || []);

                        switch (s.type) {
                            case 'yesno':
                                data[scriptId].push({
                                    key: metadata.key,
                                    type: 'yesno',
                                    labels: [
                                        metadata.positiveLabel || 'Yes',
                                        metadata.negativeLabel || 'No',
                                    ],
                                    values: [
                                        'Yes',
                                        'No',
                                    ],
                                });
                                break;
                            case 'checklist':
                                items
                                    .forEach(item => data[scriptId].push({
                                        key: item.key,
                                        type: 'checklist',
                                        labels: [item.label],
                                        values: [item.label],
                                    }));
                                break;
                            case 'multi_select':
                                data[scriptId].push({
                                    key: metadata.key,
                                    ...items.reduce((acc, item) => ({
                                        ...acc,
                                        type: 'mult_select',
                                        values: [...acc.values, item.id],
                                        labels: [...acc.labels, item.label],
                                    }), { values: [], labels: [], }),
                                });
                                break;
                            case 'single_select':
                                data[scriptId].push({
                                    key: metadata.key,
                                    type: 'single_select',
                                    ...items.reduce((acc, item) => ({
                                        ...acc,
                                        values: [...acc.values, item.id],
                                        labels: [...acc.labels, item.label],
                                    }), { values: [], labels: [], }),
                                });
                                break;
                            case 'form':
                                fields.forEach(field => {
                                    const fieldsTypes = {
                                        DATE: 'date',
                                        DATETIME: 'datetime',
                                        DROPDOWN: 'dropdown',
                                        NUMBER: 'number',
                                        PERIOD: 'period',
                                        TEXT: 'text',
                                        TIME: 'time'
                                    };
                                    const opts = (field.values || '').split('\n')
                                        .map((v = '') => v.trim())
                                        .filter((v) => v)
                                        .map((v) => {
                                            v = v.split(',');
                                            return { value: v[0], label: v[1], };
                                        });
                                    switch (field.type) {
                                        case fieldsTypes.NUMBER:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'number',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        case fieldsTypes.DATE:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'date',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        case fieldsTypes.DATETIME:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'datetime',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        case fieldsTypes.DROPDOWN:
                                            data[scriptId].push({
                                                key: field.key,
                                                labels: opts.map(o => o.label),
                                                values: opts.map(o => o.value),
                                            });
                                            break;
                                        case fieldsTypes.PERIOD:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'number',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        case fieldsTypes.TEXT:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'text',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        case fieldsTypes.TIME:
                                            data[scriptId].push({
                                                key: field.key,
                                                type: 'time',
                                                labels: [],
                                                values: [],
                                            });
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                break;
                            case 'timer':
                                data[scriptId].push({
                                    values: [],
                                    labels: [],
                                    key: metadata.key,
                                    type: 'number',
                                });
                                break;
                            case 'progress':
                                
                                break;
                            case 'management':
                                
                                break;
                            case 'list':
                                
                                break;
                            case 'diagnosis':
                                
                                break;
                            case 'zw_edliz_summary_table':
                                
                                break;
                            case 'mwi_edliz_summary_table':
                                
                                break;
                            case 'edliz_summary_table':
                                
                                break;
                            default:
                                // do nothing
                        }
                    });
                }

                const filename = `${scriptIds.join('_')}.json`;
                const mimetype = 'application/json';

                res.setHeader('Content-disposition', `attachment; filename=${filename}`);
                res.setHeader('Content-type', mimetype);

                res.json(scriptIds.length > 1 ? data : Object.values(data)[0]);
            } catch(e) {
                res.status(500).json({ error: e.message, });
            }
        })();
    });

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
