import sqlz from './sequelize';
import User from './User';
import File from './File';
import UserProfile from './UserProfile';
import Script from './Script';
import Screen from './Screen';
import Diagnosis from './Diagnosis';
import ConfigKey from './ConfigKey';
import ApiKey from './ApiKey';

export {
  User,
  File,
  UserProfile,
  Script,
  Screen,
  Diagnosis,
  ConfigKey,
  ApiKey,
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
    ]).then(rslts => {
      resolve(rslts);
      User.count({})
        .then(count => {
          if (!count) User.create({ email: 'ldt@bwsonline.co.za', role: 1 });
        });
    })
      .catch(err => reject(err));
  }).catch(err => {
    reject(err);
  });
});
