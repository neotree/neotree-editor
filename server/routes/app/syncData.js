import { Op } from 'sequelize';
import { Script, Screen, ConfigKey, Diagnosis, Log } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;
  const lastSyncDate = payload.lastSyncDate ?
    new Date(payload.lastSyncDate).getTime() : null;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Promise.all([
    !lastSyncDate ? null : Log.findAll({
      where: {
        createdAt: { [Op.gte]: lastSyncDate },
        name: { [Op.or]: ['delete_scripts', 'delete_screens', 'delete_daignoses', 'deleteconfig_keys'] },
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
        scripts: {
          lastCreated: rslts[1] || [],
          lastUpdated: rslts[2] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'delete_scripts')
            .reduce((acc, log) => [...acc, ...(log.data.scripts || []).map(s => ({ id: s.id }))], []),
        },
        screens: {
          lastCreated: rslts[3] || [],
          lastUpdated: rslts[4] || [],
          lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_screens')
            .reduce((acc, log) => [...acc, ...(log.data.screens || []).map(s => ({ id: s.id }))], []),
        },

        diagnoses: {
          lastCreated: rslts[5] || [],
          lastUpdated: rslts[6] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'delete_diagnoses')
            .reduce((acc, log) => [...acc, ...(log.data.diagnoses || []).map(s => ({ id: s.id }))], []),
        },

        config_keys: {
          lastCreated: rslts[7] || [],
          lastUpdated: rslts[8] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(log => log.name === 'deleteconfig_keys')
            .reduce((acc, log) => [...acc, ...(log.data.config_keys || []).map(s => ({ id: s.id }))], []),
        }
      });
    })
    .catch(done);
};
