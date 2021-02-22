import { Op } from 'sequelize';
import * as database from '../../database';

export default function shouldBackup() {
  return new Promise((resolve, reject) => {
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
}
