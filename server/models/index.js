import sqlz from './sequelize';
import User from './_User';
import File from './_File';
import UserProfile from './_UserProfile';
import Script from './_Script';
import Screen from './_Screen';
import Diagnosis from './_Diagnosis';
import ConfigKey from './_ConfigKey';
import ApiKey from './_ApiKey';
import Device from './_Device';
import Log from './_Log';

export {
  User,
  File,
  UserProfile,
  Script,
  Screen,
  Diagnosis,
  ConfigKey,
  ApiKey,
  Device,
  Log,
};

export const sequelize = sqlz;

export const dbInit = () => new Promise((resolve, reject) => {
  const initUsersTable = (async () => await User.sync())();
  const initFilesTable = (async () => await File.sync())();
  const initUserProfilesTable = (async () => await UserProfile.sync())();
  const initScriptsTable = (async () => await Script.sync())();
  const initScreensTable = (async () => await Screen.sync())();
  const initDiagnosesTable = (async () => await Diagnosis.sync())();
  const initConfigKeysTable = (async () => await ConfigKey.sync())();
  const initApiKeysTable = (async () => await ApiKey.sync())();
  const initDeviceTable = (async () => await Device.sync())();
  const initLogTable = (async () => await Log.sync())();

  sqlz.authenticate()
  .then(() => {
    console.log('Connected to the database.'); // eslint-disable-line
    Promise.all([
      initUsersTable,
      initFilesTable,
      initUserProfilesTable,
      initScriptsTable,
      initScreensTable,
      initDiagnosesTable,
      initConfigKeysTable,
      initApiKeysTable,
      initDeviceTable,
      initLogTable,
    ]).then(() => {
      resolve(sequelize);
      User.count({})
        .then(count => {
          if (!count) User.create({ email: 'ldt@bwsonline.co.za', role: 1 });
        });
    })
      .catch(err => reject(err));
  }).catch(err => {
    console.log('DATABASE INIT ERROR:', e); // eslint-disable-line
    reject(err);
    process.exit(1);
  });
});
