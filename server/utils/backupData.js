import fs from 'fs';
import { Op } from 'sequelize';
import * as database from '../database';

export const shouldBackup = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      let appInfo = null;
      appInfo = await database.App.findOne({ where: { id: 1 } });
      appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));

      if (!appInfo) return resolve(true);

      const whereLastUpdated = !appInfo.last_backup_date ? {} : {
        updatedAt: { [Op.gte]: appInfo.last_backup_date },
        deletedAt: null,
      };
      const countScripts = await database.Script.count({ where: whereLastUpdated });
      const countScreens = await database.Screen.count({ where: whereLastUpdated });
      const countDiagnoses = await database.Diagnosis.count({ where: whereLastUpdated });
      const countConfigKeys = await database.ConfigKey.count({ where: whereLastUpdated });
      const countHospitals = await database.Hospital.count({ where: whereLastUpdated });

      const whereLastDeleted = !appInfo.last_backup_date ? {} : { deletedAt: { [Op.gte]: appInfo.last_backup_date }, };
      const countDeletedScripts = await database.Script.count({ where: whereLastDeleted });
      const countDeletedScreens = await database.Screen.count({ where: whereLastDeleted });
      const countDeletedDiagnoses = await database.Diagnosis.count({ where: whereLastDeleted });
      const countDeletedConfigKeys = await database.ConfigKey.count({ where: whereLastDeleted });
      const countDeletedHospitals = await database.Hospital.count({ where: whereLastDeleted });

      resolve(!!(
        countScripts ||
        countScreens ||
        countDiagnoses ||
        countConfigKeys ||
        countHospitals ||
        countDeletedScripts ||
        countDeletedScreens ||
        countDeletedDiagnoses ||
        countDeletedConfigKeys ||
        countDeletedHospitals
      ));
    } catch (e) { reject(e); }
  })();
});

export default function backupData(app) {
  const { io } = app;
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const _shouldBackup = await shouldBackup();

        if (_shouldBackup) {
          const dataDirPath = `${process.env.BACKUP_DIR_PATH}/${process.env.APP_ENV}`;
          const dir = fs.readdirSync(process.env.BACKUP_DIR_PATH);
          const dataDir = dir.filter(n => n === process.env.APP_ENV)[0];
          const lastBackUpDetails = !dataDir ? {} : fs.readFileSync(`${dataDirPath}/app.json`);

          let appInfo = await database.App.findOne({ where: { id: 1 }, limit: 1, });
          appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
          appInfo = { ...appInfo };

          if (!dataDir) fs.mkdirSync(dataDirPath);

          const whereLastUpdated = !lastBackUpDetails.last_backup_date ? {} : {
            updatedAt: { $gt: lastBackUpDetails.last_backup_date },
            deletedAt: null,
          };
          const scripts = await database.Script.findAll({ where: whereLastUpdated });
          const screens = await database.Screen.findAll({ where: whereLastUpdated });
          const diagnoses = await database.Diagnosis.findAll({ where: whereLastUpdated });
          const configKeys = await database.ConfigKey.findAll({ where: whereLastUpdated });
          const hospitals = await database.Hospital.findAll({ where: whereLastUpdated });
          // const files = await database.File.findAll({ where: whereLastUpdated });

          const writeData = (data = [], folder) => data.map(item => new Promise((resolve, reject) => {
            if (!fs.existsSync(`${dataDirPath}/${folder}`)) fs.mkdirSync(`${dataDirPath}/${folder}`);
            try {
              fs.writeFileSync(`${dataDirPath}/${folder}/${item.id}.json`, JSON.stringify(item));
              resolve();
            } catch (e) { reject(e); }
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

          const whereLastDeleted = !lastBackUpDetails.last_backup_date ? {} : { deletedAt: { $gt: lastBackUpDetails.last_backup_date }, };
          const deletedScripts = await database.Script.findAll({ where: whereLastDeleted });
          const deletedScreens = await database.Screen.findAll({ where: whereLastDeleted });
          const deletedDiagnoses = await database.Diagnosis.findAll({ where: whereLastDeleted });
          const deletedConfigKeys = await database.ConfigKey.findAll({ where: whereLastDeleted });
          const deletedHospitals = await database.Hospital.findAll({ where: whereLastDeleted });
          // const deletedFiles = await database.File.findAll({ where: whereLastDeleted });

          const deleteData = (data = [], folder) => data.map(item => new Promise((resolve, reject) => {
            if (!fs.existsSync(`${dataDirPath}/${folder}`)) fs.mkdirSync(`${dataDirPath}/${folder}`);
            try {
              fs.unlinkSync(`${dataDirPath}/${folder}/${item.id}.json`);
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
          fs.writeFileSync(`${dataDirPath}/app.json`, JSON.stringify(appInfo));
          io.emit('data_published');
        }

        resolve();
      } catch (e) { console.log('ERROR', e); reject(e); }
    })();
  });
};
