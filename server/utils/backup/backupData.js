import fs from 'fs';
import { Op } from 'sequelize';
import { exec } from 'child_process';
import * as database from '../../database';
import shouldBackup from './shouldBackup';

export default function backupData() {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(process.env.BACKUP_DIR_PATH)) return reject(new Error('Backup directory not found'));
    } catch (e) { return reject(e); }

    (async () => {
      try {
        const _shouldBackup = await shouldBackup();

        if (_shouldBackup) {
          let lastBackUpDetails = fs.existsSync(`${process.env.BACKUP_DIR_PATH}/app.json`) ?
            fs.readFileSync(`${process.env.BACKUP_DIR_PATH}/app.json`) : JSON.stringify({});
          lastBackUpDetails = JSON.parse(lastBackUpDetails);

          let appInfo = await database.App.findOne({ where: { id: 1 }, limit: 1, });
          appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
          appInfo = { ...appInfo };

          const whereLastUpdated = !lastBackUpDetails.last_backup_date ? {} : {
            updatedAt: { [Op.gte]: lastBackUpDetails.last_backup_date },
            deletedAt: null,
          };

          const scripts = await database.Script.findAll({ where: whereLastUpdated });
          const screens = await database.Screen.findAll({ where: whereLastUpdated });
          const diagnoses = await database.Diagnosis.findAll({ where: whereLastUpdated });
          const configKeys = await database.ConfigKey.findAll({ where: whereLastUpdated });
          const hospitals = await database.Hospital.findAll({ where: whereLastUpdated });
          // const files = await database.File.findAll({ where: whereLastUpdated });

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

          const writeData = (data = [], folder) => data.map(item => new Promise((resolve, reject) => {
            (async () => {
              if (!fs.existsSync(`${process.env.BACKUP_DIR_PATH}/${folder}`)) fs.mkdirSync(`${process.env.BACKUP_DIR_PATH}/${folder}`);
              try {
                fs.writeFileSync(`${process.env.BACKUP_DIR_PATH}/${folder}/${item.id}.json`, JSON.stringify(item));
              } catch (e) { return reject(e); }

              try {
                const files = await readDir(folder);
                files.filter(f => f.deletedAt).forEach(f => fs.unlinkSync(`${process.env.BACKUP_DIR_PATH}/${folder}/${f.id}.json`));
              } catch (e) { /* DO NOTHING */ }

              resolve();
            })();
          }));

          await Promise.all(Object.assign(
            [],
            writeData(scripts, 'scripts'),
            writeData(screens, 'screens'),
            writeData(diagnoses, 'diagnoses'),
            writeData(configKeys, 'configKeys'),
            writeData(hospitals, 'hospitals'),
            // writeData(files, 'files')
          ));

          if (lastBackUpDetails.last_backup_date) {
            const whereLastDeleted = { deletedAt: { [Op.gte]: lastBackUpDetails.last_backup_date }, };
            const deletedScripts = await database.Script.findAll({ where: whereLastDeleted });
            const deletedScreens = await database.Screen.findAll({ where: whereLastDeleted });
            const deletedDiagnoses = await database.Diagnosis.findAll({ where: whereLastDeleted });
            const deletedConfigKeys = await database.ConfigKey.findAll({ where: whereLastDeleted });
            const deletedHospitals = await database.Hospital.findAll({ where: whereLastDeleted });
            // const deletedFiles = await database.File.findAll({ where: whereLastDeleted });

            const deleteData = (data = [], folder) => data.map(item => new Promise((resolve, reject) => {
              if (!fs.existsSync(`${process.env.BACKUP_DIR_PATH}/${folder}`)) fs.mkdirSync(`${process.env.BACKUP_DIR_PATH}/${folder}`);
              try {
                fs.unlinkSync(`${process.env.BACKUP_DIR_PATH}/${folder}/${item.id}.json`);
                resolve();
              } catch (e) { reject(e); }
            }));

            await Promise.all(Object.assign(
              [],
              deleteData(deletedScripts, 'scripts'),
              deleteData(deletedScreens, 'screens'),
              deleteData(deletedDiagnoses, 'diagnoses'),
              deleteData(deletedConfigKeys, 'configKeys'),
              deleteData(deletedHospitals, 'hospitals'),
              // deleteData(deletedFiles, 'files')
            ));
          }

          let rslts = null;
          appInfo = { ...appInfo, last_backup_date: new Date(), version: (appInfo.version || 0) + 1, };
          if (appInfo.id !== 1) {
            rslts = await database.App.findOrCreate({
              where: { id: 1 },
              defaults: appInfo
            });
            appInfo = JSON.parse(JSON.stringify(rslts[0]));
          } else {
            rslts = await database.App.update(appInfo, { where: { id: 1 } });
          }
          fs.writeFileSync(`${process.env.BACKUP_DIR_PATH}/app.json`, JSON.stringify(appInfo));

          exec(
            `cd ${process.env.BACKUP_DIR_PATH} && git add . && git commit -m v${appInfo.version} && git push origin master`,
            (error, stdout, stderr
          ) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
          });
        }

        resolve();
      } catch (e) { reject(e); }
    })();
  });
};
