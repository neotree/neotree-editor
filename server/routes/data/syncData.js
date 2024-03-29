import fs from 'fs';
import { Op } from 'sequelize';
import { Script, Screen, ConfigKey, Diagnosis, Device, App } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { lastSyncDate: _lastSyncDate, deviceId, scriptsCount, mode, deviceDataOnly, } = req.query;
    const lastSyncDate = _lastSyncDate ? new Date(_lastSyncDate).getTime() : null;

    const done = (e, payload) => {
      res.locals.setResponse(e, payload);
      next();
    };

    let webeditorInfo = await App.findAll({ where: {} });
    webeditorInfo = webeditorInfo ? webeditorInfo[0] : null;

    let device = null;
    if (deviceId) {
      try { device = await Device.findOne({ where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }

      if (device && scriptsCount && (scriptsCount !== device.details.scripts_count)) {
        const details = JSON.stringify({ ...device.details, scripts_count: scriptsCount, });
        try { await Device.update({ details }, { where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }

        try { device = await Device.findOne({ where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }
      }
    }

    try {
      let scripts = [];
      let screens = [];
      let diagnoses = [];
      let configKeys = [];
      let deletedScripts = [];
      let deletedScreens = [];
      let deletedDiagnoses = [];
      let deletedConfigKeys = [];

      const backUpFolderExists = fs.existsSync(process.env.BACKUP_DIR_PATH);

	if (backUpFolderExists && (mode === 'production')) {
		const readDir = dir => new Promise((resolve, reject) => {
		(async () => {
			dir = `${process.env.BACKUP_DIR_PATH}/${dir}`;

			try {
			if (!fs.existsSync(process.env.BACKUP_DIR_PATH)) return reject(new Error('Backup directory not found'));

			const files = await Promise.all(fs.readdirSync(dir).map(fname => new Promise(resolve => {
				const data = fs.readFileSync(`${dir}/${fname}`);
				resolve(JSON.parse(data));
			})));
			resolve(files.sort((a, b) => a.id - b.id));
			} catch (e) { return reject(e); }
		})();
		});

		if (!deviceDataOnly) {
			scripts = await readDir('scripts');
			screens = await readDir('screens');
			diagnoses = await readDir('diagnoses');
		}
		configKeys = await readDir('configKeys');
	} else {
		const whereLastSyncDateGreaterThanLastUpdated = !lastSyncDate ? {} : { updatedAt: { [Op.gte]: lastSyncDate } };
		const whereLastSyncDateGreaterThanLastDeleted = !lastSyncDate ? {} : { deletedAt: { [Op.gte]: lastSyncDate } };
		if (!deviceDataOnly) {		
			scripts = await Script.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } });
			deletedScripts = await Script.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } });

			screens = await Screen.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } });
			deletedScreens = await Screen.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } });

			diagnoses = await Diagnosis.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } });
			deletedDiagnoses = await Diagnosis.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } });
		}

		configKeys = await ConfigKey.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } });
		deletedConfigKeys = await ConfigKey.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } });
	}

      done(null, {
        webeditorInfo,
        device,
        scripts,
        deletedScripts,
        screens,
        deletedScreens,
        diagnoses,
        deletedDiagnoses,
        configKeys,
        deletedConfigKeys,
      });
    } catch (e) { done(e); }
  })();
};
