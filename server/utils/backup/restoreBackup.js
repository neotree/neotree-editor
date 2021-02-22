import fs from 'fs';
import { Script, Screen, Diagnosis, ConfigKey, App } from '../../database';

export default function restoreBackup() {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!fs.existsSync(process.env.BACKUP_DIR_PATH)) return reject(new Error('Backup directory not found'));
      } catch (e) { return reject(e); }

      let lastBackUpDetails = fs.existsSync(`${process.env.BACKUP_DIR_PATH}/app.json`) ?
        fs.readFileSync(`${process.env.BACKUP_DIR_PATH}/app.json`) : JSON.stringify({});
      lastBackUpDetails = JSON.parse(lastBackUpDetails);

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

      const scripts = await readDir('scripts');
      const screens = await readDir('screens');
      const diagnoses = await readDir('diagnoses');
      const configKeys = await readDir('configKeys');

      await Promise.all([
        Script.destroy({ where: {} }),
        Screen.destroy({ where: {} }),
        Diagnosis.destroy({ where: {} }),
        ConfigKey.destroy({ where: {} }),
      ]);

      const saveData = (Model, data = []) => new Promise((resolve, reject) => {
        (async () => {
          try {
            const rslts = await Promise.all(data.map(item => Model.create({
              ...item,
              data: JSON.stringify(item.data)
            })));
            resolve(rslts);
          } catch (e) { reject(e); }
        })();
      });

      await saveData(Script, scripts);
      await saveData(Screen, screens);
      await saveData(Diagnosis, diagnoses);
      await saveData(ConfigKey, configKeys);
      await App.update({ ...lastBackUpDetails, last_backup_date: new Date(), }, { where: { id: 1 } });

      resolve();
    })();
  });
}
