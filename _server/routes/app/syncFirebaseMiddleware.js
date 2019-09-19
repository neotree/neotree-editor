import { ConfigKey, Screen, Script, Diagnosis } from '../../models';

module.exports = () => (req, res) => {
  Promise.all([
    ConfigKey.findAll({}),
    Script.findAll({}),
    Screen.findAll({}),
    Diagnosis.findAll({})
  ]).then(([cKeys, scripts, screens, diagnoses]) => {
    const promises = [];
    cKeys.forEach(item => promises.push(ConfigKey.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    scripts.forEach(item => promises.push(Script.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    screens.forEach(item => promises.push(Screen.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    diagnoses.forEach(item => promises.push(Diagnosis.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));

    Promise.all(promises).then(() => res.json({ status: 'OK' }))
      .catch(error => res.json({ error }));
  }).catch(error => res.json({ error }));
};
