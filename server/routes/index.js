import express from 'express';
import * as database from '../database';
import { backupData, shouldBackup, restoreBackup } from '../utils/backup';

const router = express.Router();

module.exports = app => {
  router
    .use(require('./auth')(app))
    .use(require('./data')(app))
    .use('/api', require('./api')(app))
    .use(require('./files')(app))
    .use(require('./users')(app))
    .use(require('./scripts')(app))
    .use(require('./screens')(app))
    .use(require('./diagnoses')(app))
    .use(require('./config-keys')(app))
    .use(require('./devices')(app))
    .use(require('./hospitals')(app));

  router.get('/get-app-info', (req, res) => {
    (async () => {
      try {
        const appInfo = await database.App.findOne({ where: { id: 1 } });
        const _shouldBackup = await shouldBackup();
        res.json({ shouldBackup: _shouldBackup, appInfo });
      } catch (e) { res.json({ errors: [e.message] }); }
    })();
  });

  router.post('/publish-changes', (req, res) => {
    (async () => {
      try {
        await backupData(app, req);
        const appInfo = await database.App.findOne({ id: 1 });
        const _shouldBackup = await shouldBackup();
        app.io.emit('data_published');
        res.json({ shouldBackup: _shouldBackup, appInfo });
      } catch (e) { res.json({ errors: [e.message] }); }
    })();
  });

  router.post('/discard-changes', (req, res) => {
    (async () => {
      try {
        await restoreBackup(app);
        const appInfo = await database.App.findOne({ id: 1 });
        const _shouldBackup = await shouldBackup();
        app.io.emit('changes_discarded');
        res.json({ shouldBackup: _shouldBackup, appInfo });
      } catch (e) { res.json({ errors: [e.message] }); }
    })();
  });

  router.get('/get-view-mode', (req, res) => res.json({ mode: req.session.viewMode || 'view' }));

  router.post('/set-view-mode', (req, res) => {
    req.session.viewMode = req.body.viewMode;
    res.json({ viewMode: req.session.viewMode || 'view' });
  });

  return router;
};
