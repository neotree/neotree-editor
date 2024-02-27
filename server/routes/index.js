import express from 'express';
import http from 'http';
import https from 'https';
import * as database from '../database';
import { backupData, shouldBackup, restoreBackup } from '../utils/backup';
import { testCounty } from './addStatsMiddleware';

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

  router.get('/remove-confidential-data', (req, res) => {
    (async () => {
      try {
		console.log('getting screens...');
        const screensRes = await database.Screen.findAll({ where: { deletedAt: null }, });
        const screens = screensRes.map(screen => {
			const { data, ...s } = JSON.parse(JSON.stringify(screen));
			return { ...data, ...s };
		});
		console.log(screens.length + ' screens found...');
		const confidentialKeysMap = screens.reduce((acc, item) => {
			const metadata = { fields: [], items: [], ...item.metadata };
			const fields = metadata.fields;
			const items = metadata.items;
			fields.forEach(f => { if (f.confidential) acc[f.key] = true; });
			items.forEach(f => { if (f.confidential) acc[f.key] = true; });
			if (metadata.confidential && metadata.key) acc[metadata.key] = true;
			return acc;
		}, {});
		const keys = Object.keys(confidentialKeysMap);
		res.json({ keys });
		// console.log('posting to ' + `${process.env.NODEAPI_URL}/remove-confidential-data`, { keys });
		// const _fetch = `${process.env.NODEAPI_URL}`.substring(0, 5) === 'https' ? https : http;
		// _fetch.request(`${process.env.NODEAPI_URL}/remove-confidential-data`, { 
		// 	method: 'POST', 
		// 	body: JSON.stringify({ keys }),
		// 	headers: { 'Content-type': 'application/json; charset=UTF-8', Connection: 'keep-alive', }, 
		// }, (resp) => {
		// 	// The whole response has been received. Print out the result.
		// 	resp.on('end', () => {
		// 		res.json({ success: true, });
		// 	});

		// }).on("error", (error) => {
		// 	res.json({ error });
		// });
      } catch (e) { res.json({ errors: [e.message] }); }
    })();
  });

  router.get('/test-countly', testCounty);

  router.post('/update-app-info', (req, res) => {
    const { id, ...payload } = req.body;
    (async () => {
      try {
        await database.App.update(
          { ...payload },
          { where: { id, } }
        );
        const appInfo = await database.App.findOne({ where: { id } });
        res.json({ appInfo });
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
