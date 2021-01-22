import { ConfigKey, Screen, Diagnosis } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { configKeys: _configKeys, deleteAssociatedData, } = req.body;

    const done = (err, rslts = []) => {
      res.locals.setResponse(err, { configKeys: rslts });
      next();
    };

    let configKeys = [];
    try {
      configKeys = await ConfigKey.findAll({ where: { id: _configKeys.map(s => s.id) } });
    } catch (e) { return done(e); }

    const rslts = {};
    const deletedAt = new Date();

    try {
      rslts.configKeys = await ConfigKey.update({ deletedAt }, { where: { id: configKeys.map(s => s.id) } });

      const activeConfigKeys = await ConfigKey.findAll({ where: { deletedAt: null }, order: [['position', 'ASC']] });
      await Promise.all(activeConfigKeys.map((s, i) => ConfigKey.update({ position: i + 1, }, { where: { id: s.id } })));

      const deletedConfigKeys = await ConfigKey.findAll({ where: { deletedAt: { $not: null } }, order: [['position', 'ASC']] });
      await Promise.all(deletedConfigKeys.map((s, i) => ConfigKey.update({ position: activeConfigKeys.length + i + 1, }, { where: { id: s.id } })));
    } catch (e) { return done(e); }

    if (deleteAssociatedData !== false) {
      try {
        rslts.screens = await Screen.update({ deletedAt }, { where: { config_key_id: configKeys.map(s => s.config_key_id) } });
      } catch (e) { /* Do nothing */ }

      try {
        rslts.diagnoses = await Diagnosis.update({ deletedAt }, { where: { config_key_id: configKeys.map(s => s.config_key_id) } });
      } catch (e) { /* Do nothing */ }
    }

    done(null, rslts);
  })();
};
