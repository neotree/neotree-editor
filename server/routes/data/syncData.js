import { Op } from 'sequelize';
import { Script, Screen, ConfigKey, Diagnosis, Device, } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { lastSyncDate: _lastSyncDate, deviceId, scriptsCount, } = req.query;
    const lastSyncDate = _lastSyncDate ? new Date(_lastSyncDate).getTime() : null;

    const done = (e, payload) => {
      res.locals.setResponse(e, payload);
      next();
    };

    let device = null;
    if (deviceId) {
      try { device = await Device.findOne({ where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }

      if (device && scriptsCount && (scriptsCount !== device.details.scripts_count)) {
        const details = JSON.stringify({ ...device.details, scripts_count: scriptsCount, });
        try { await Device.update({ details }, { where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }

        try { device = await Device.findOne({ where: { device_id: deviceId } }); } catch (e) { /* do nothing */ }
      }
    }

    const whereLastSyncDateGreaterThanLastUpdated = !lastSyncDate ? {} : { updatedAt: { [Op.gte]: lastSyncDate } };
    const whereLastSyncDateGreaterThanLastDeleted = !lastSyncDate ? {} : { deletedAt: { [Op.gte]: lastSyncDate } };

    Promise.all([
      Script.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } }),
      Script.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } }),

      Screen.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } }),
      Screen.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } }),

      Diagnosis.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } }),
      Diagnosis.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } }),

      ConfigKey.findAll({ where: { deletedAt: null, ...whereLastSyncDateGreaterThanLastUpdated } }),
      ConfigKey.findAll({ where: { deletedAt: { $not: null }, ...whereLastSyncDateGreaterThanLastDeleted } }),
    ])
      .then(([
        scripts,
        deletedScripts,
        screens,
        deletedScreens,
        diagnoses,
        deletedDiagnoses,
        configKeys,
        deletedConfigKeys,
      ]) => {
        done(null, {
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
      })
      .catch(done);
  })();
};
