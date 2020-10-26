import { Op } from 'sequelize';
import { Script, Screen, ConfigKey, Diagnosis, Log, Device, } from '../../database';

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

    Promise.all([
      !lastSyncDate ? null : Log.findAll({
        where: {
          createdAt: { [Op.gte]: lastSyncDate },
          name: { [Op.or]: ['delete_scripts', 'delete_screens', 'delete_diagnoses', 'delete_config_keys'] },
        }
      }),

      Script.findAll({ where: !lastSyncDate ?
          {} : { updatedAt: { [Op.gte]: lastSyncDate } } }),
      Script.findAll({ where: !lastSyncDate ?
          {} : { createdAt: { [Op.gte]: lastSyncDate } } }),

      Screen.findAll({ where: !lastSyncDate ?
          {} : { updatedAt: { [Op.gte]: lastSyncDate } } }),
      Screen.findAll({ where: !lastSyncDate ?
          {} : { createdAt: { [Op.gte]: lastSyncDate } } }),

      Diagnosis.findAll({ where: !lastSyncDate ?
          {} : { updatedAt: { [Op.gte]: lastSyncDate } } }),
      Diagnosis.findAll({ where: !lastSyncDate ?
          {} : { createdAt: { [Op.gte]: lastSyncDate } } }),

      ConfigKey.findAll({ where: !lastSyncDate ?
          {} : { updatedAt: { [Op.gte]: lastSyncDate } } }),
      ConfigKey.findAll({ where: !lastSyncDate ?
          {} : { createdAt: { [Op.gte]: lastSyncDate } } }),
    ])
      .then((rslts = []) => {
        done(null, {
          device,

          scripts: {
            lastCreated: rslts[1] || [],
            lastUpdated: rslts[2] || [],
            lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'delete_scripts')
              .reduce((acc, log) => [...acc, ...(log.data.scripts || []).map(s => ({ scriptId: s.scriptId }))], []),
          },
          screens: {
            lastCreated: rslts[3] || [],
            lastUpdated: rslts[4] || [],
            lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_screens')
              .reduce((acc, log) => [...acc, ...(log.data.screens || []).map(s => ({ screenId: s.screenId }))], []),
          },

          diagnoses: {
            lastCreated: rslts[5] || [],
            lastUpdated: rslts[6] || [],
            lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'delete_diagnoses')
              .reduce((acc, log) => [...acc, ...(log.data.diagnoses || []).map(s => ({ diagnosisId: s.diagnosisId }))], []),
          },

          config_keys: {
            lastCreated: rslts[7] || [],
            lastUpdated: rslts[8] || [],
            lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'delete_config_keys')
              .reduce((acc, log) => [...acc, ...(log.data.config_keys || []).map(s => ({ configKeyId: s.configKeyId }))], []),
          }
        });
      })
      .catch(done);
  })();
};
