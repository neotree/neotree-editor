import Sequelize from 'sequelize';
// import SessionModel from './Session';
import UserModel from './User';
import FileModel from './File';
import AppModel from './App';
import UserProfileModel from './User/Profile';
import ScriptModel from './Script';
import ScreenModel from './Screen';
import DiagnosisModel from './Diagnosis';
import ConfigKeyModel from './ConfigKey';

const dbConfig = process.env.NODE_ENV === 'production' ?
  require('../../_config/config.production.json').database
  :
  require('../../_config/config.development.json').database;

export const sequelize = new Sequelize(
  process.env.DATABASE_NAME || dbConfig.database,
  process.env.DATABASE_USERNAME || dbConfig.username,
  process.env.DATABASE_PASSWORD || dbConfig.password,
  { host: dbConfig.host || 'localhost', dialect: 'postgres', logging: false }
);

// export const Session = sequelize.define(
//   'Session',
//   SessionModel.getStructure({ Sequelize })
// );

export const User = sequelize.define(
  'user',
  UserModel.getStructure({ Sequelize })
);
Object.keys(UserModel).forEach(key => (User[key] = UserModel[key]));

export const File = sequelize.define(
  'file',
  FileModel.getStructure({ User, Sequelize })
);
Object.keys(FileModel).forEach(key => (File[key] = FileModel[key]));

export const UserProfile = sequelize.define(
  'user_profile',
  UserProfileModel.getStructure({ User, Sequelize })
);
Object.keys(UserProfileModel).forEach(key => (UserProfile[key] = UserProfileModel[key]));
User.Profile = UserProfile;

export const App = sequelize.define(
  'app',
  AppModel.getStructure({ User, Sequelize })
);
Object.keys(AppModel).forEach(key => (App[key] = AppModel[key]));

export const Script = sequelize.define(
  'script',
  ScriptModel.getStructure({ User, Sequelize })
);
Object.keys(ScriptModel).forEach(key => (Script[key] = ScriptModel[key]));

export const Screen = sequelize.define(
  'screen',
  ScreenModel.getStructure({ User, Sequelize })
);
Object.keys(ScreenModel).forEach(key => (Screen[key] = ScreenModel[key]));

export const Diagnosis = sequelize.define(
  'diagnosis',
  DiagnosisModel.getStructure({ User, Sequelize })
);
Object.keys(DiagnosisModel).forEach(key => (Diagnosis[key] = DiagnosisModel[key]));

export const ConfigKey = sequelize.define(
  'config_key',
  ConfigKeyModel.getStructure({ User, Sequelize }),
);
Object.keys(ConfigKeyModel).forEach(key => (ConfigKey[key] = ConfigKeyModel[key]));

export const dbInit = () => new Promise((resolve, reject) => {
  // const initSessionsTable = (async () => await Session.sync())();
  const initUsersTable = (async () => await User.sync())();
  const initFilesTable = (async () => await File.sync())();
  const initUserProfilesTable = (async () => await UserProfile.sync())();
  const initAppTable = (async () => await App.sync())();
  const initScriptsTable = (async () => await Script.sync())();
  const initScreensTable = (async () => await Screen.sync())();
  const initDiagnosesTable = (async () => await Diagnosis.sync())();
  const initConfigKeysTable = (async () => await ConfigKey.sync())();

  sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database.'); // eslint-disable-line
    Promise.all([
      // initSessionsTable,
      initUsersTable,
      initFilesTable,
      initUserProfilesTable,
      initAppTable,
      initScriptsTable,
      initScreensTable,
      initDiagnosesTable,
      initConfigKeysTable,
    ]).then(rslts => resolve(rslts))
      .catch(err => reject(err));
  }).catch(err => {
    reject(err);
  });
});
