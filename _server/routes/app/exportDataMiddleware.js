import fs from 'fs';
import path from 'path';
import { Script, Screen, Diagnosis, ConfigKey } from '../../models';

module.exports = () => (req, res) => {
  const { script, configKey, allScripts, allConfigKeys } = req.query;

  const done = (error, data = {}) => {
    let name = 'neotree';
    if (configKey) name = `${name}-config_key-${configKey}`;
    if (script) name = `${name}-script-${script}`;
    name = `${name}.json`;

    const dest = path.resolve(__dirname, `../../tmp_uploads/${name}`);

    fs.writeFile(dest, JSON.stringify(data), error => { // write-file
      if (error) return res.json({ error });

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=${name}`
      });

      const stream = fs.createReadStream(dest);
      stream.on('end', () => fs.unlink(dest, () => { /**/ }));
      stream.pipe(res);
    });

    return null;
  };

  if (script || configKey) {
    return Promise.all([
      configKey ? ConfigKey.findOne({ where: { id: configKey } }) : null,
      script ? Script.findOne({ where: { id: script } }) : null,
      script ? Screen.findAll({ where: { script_id: script } }) : null,
      script ? Diagnosis.findAll({ where: { script_id: script } }) : null
    ]).then(([configKey, script, screens, diagnoses]) => {
      const data = {};

      if (configKey) data.configKeys = [configKey];

      if (script) {
        script = script.toJSON();
        script.screens = screens || [];
        script.diagnoses = diagnoses || [];
        data.scripts = [script];
      }

      return done(null, data);
    }).catch(done);
  }

  if (allScripts || allConfigKeys) {
    Promise.all([
      allConfigKeys ? ConfigKey.findAll({}) : null,
      allScripts ? Script.findAll({}) : null,
      allScripts ? Screen.findAll({}) : null,
      allScripts ? Diagnosis.findAll({}) : null,
    ]).then(([configKeys, scripts, screens, diagnoses]) => {
      const data = {};

      if (configKeys) {
        data.configKeys = configKeys.map(k => k.toJSON());
      }

      if (scripts) {
        data.scripts = scripts.map(script => ({
          ...script.toJSON(),
          screens: screens.filter(scr => scr.script_id === script.id)
            .map(scr => scr.toJSON()),
          diagnoses: diagnoses.filter(d => d.script_id === script.id)
            .map(scr => scr.toJSON())
        }));
      }

      return done(null, data);
    }).catch(done);
  }
};
