import { Op } from 'sequelize';
import { Script, Screen, ConfigKey, Diagnosis, Log } from '../../models';

module.exports = () => (req, res, next) => {
  const { lastSyncDate, ...payload } = JSON.parse(req.query.payload || '{}');

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Promise.all([
    Log.findAll({
      where: {
        createdAt: { [Op.gte]: (lastSyncDate ? new Date(lastSyncDate) : new Date()).getTime() },
        name: { [Op.or]: ['delete_scripts', 'delete_screens', 'delete_daignoses', 'delete_config_keys'] },
      }
    }),

    Script.count({ where: { ...payload.countScripts } }),
    Script.findAll({ where: { ...payload.lastCreatedScripts }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    Script.findAll({ where: { ...payload.lastUpdatedScripts }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),

    Screen.count({ where: { ...payload.countScreens } }),
    Screen.findAll({ where: { ...payload.lastCreatedScreens }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    Screen.findAll({ where: { ...payload.lastUpdatedScreens }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),

    Diagnosis.count({ where: { ...payload.countDiagnoses } }),
    Diagnosis.findAll({ where: { ...payload.lastCreatedDiagnoses }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    Diagnosis.findAll({ where: { ...payload.lastUpdatedDiagnoses }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),

    ConfigKey.count({ where: { ...payload.countConfigKeys } }),
    ConfigKey.findAll({ where: { ...payload.lastCreatedConfigKeys }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    ConfigKey.findAll({ where: { ...payload.lastUpdatedConfigKeys }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),
  ])
    .then((rslts = []) => {
      done(null, {
        scripts: {
          count: rslts[1],
          lastCreatedDate: rslts[2] && rslts[2][0] ? rslts[2][0].createdAt : null,
          lastUpdatedDate: rslts[3] && rslts[3][0] ? rslts[3][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_scripts')
            .reduce((acc, log) => [...acc, ...(log.data.scripts || []).map(s => s.id)], []),
        },
        screens: {
          count: rslts[4],
          lastCreatedDate: rslts[5] && rslts[5][0] ? rslts[5][0].createdAt : null,
          lastUpdatedDate: rslts[6] && rslts[6][0] ? rslts[6][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_screens')
            .reduce((acc, log) => [...acc, ...(log.data.screens || []).map(s => s.id)], []),
        },

        diagnoses: {
          count: rslts[7],
          lastCreatedDate: rslts[8] && rslts[8][0] ? rslts[8][0].createdAt : null,
          lastUpdatedDate: rslts[9] && rslts[9][0] ? rslts[9][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_diagnoses')
            .reduce((acc, log) => [...acc, ...(log.data.diagnoses || []).map(s => s.id)], []),
        },

        config_keys: {
          count: rslts[10],
          lastCreatedDate: rslts[11] && rslts[11][0] ? rslts[11][0].createdAt : null,
          lastUpdatedDate: rslts[12] && rslts[12][0] ? rslts[12][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(log => log.name === 'delete_config_keys')
            .reduce((acc, log) => [...acc, ...(log.data.config_keys || []).map(s => s.id)], []),
        }
      });
    })
    .catch(done);
};
