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
import UserInterfaceModel from './UserInterface';

import * as firebase from '../firebase';

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

export const UserInterface = sequelize.define(
  'user_interface',
  UserInterfaceModel.getStructure({ Sequelize })
);
Object.keys(UserInterfaceModel).forEach(key => (UserInterface[key] = UserInterfaceModel[key]));

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
Script.afterCreate(script => {
  const { id, data, ...scr } = JSON.parse(JSON.stringify(script));
  firebase.set('screens', id, {});
  firebase.set('diagnosis', id, {});
  firebase.set('scripts', id, { ...data, ...scr, scriptId: id });
  return new Promise(resolve => resolve(script));
});
Script.afterUpdate(script => {
  const { id, data, ...scr } = JSON.parse(JSON.stringify(script));
  firebase.update('screens', id, {});
  firebase.update('diagnosis', id, {});
  firebase.update('scripts', id, { ...data, ...scr, scriptId: id });
  return new Promise(resolve => resolve(script));
});
Object.keys(ScriptModel).forEach(key => (Script[key] = ScriptModel[key]));

export const Screen = sequelize.define(
  'screen',
  ScreenModel.getStructure({ User, Sequelize })
);
Screen.afterCreate(screen => {
  const { id, script_id, data, ...scr } = JSON.parse(JSON.stringify(screen));
  firebase.update('screens', script_id, {
    [id]: { ...data, ...scr, screenId: id }
  });
  return new Promise(resolve => resolve(screen));
});
Screen.afterUpdate(screen => {
  const { id, script_id, data, ...scr } = JSON.parse(JSON.stringify(screen));
  firebase.update('screens', script_id, {
    [id]: { ...data, ...scr, screenId: id }
  });
  return new Promise(resolve => resolve(screen));
});
Object.keys(ScreenModel).forEach(key => (Screen[key] = ScreenModel[key]));

export const Diagnosis = sequelize.define(
  'diagnosis',
  DiagnosisModel.getStructure({ User, Sequelize })
);
Diagnosis.afterCreate(diagnosis => {
  const { id, script_id, data, ...d } = JSON.parse(JSON.stringify(diagnosis));
  firebase.update('diagnosis', script_id, {
    [id]: { ...data, ...d, diagnosisId: id }
  });
  return new Promise(resolve => resolve(diagnosis));
});
Diagnosis.afterUpdate(diagnosis => {
  const { id, script_id, data, ...d } = JSON.parse(JSON.stringify(diagnosis));
  firebase.update('diagnosis', script_id, {
    [id]: { ...data, ...d, diagnosisId: id }
  });
  return new Promise(resolve => resolve(diagnosis));
});
Object.keys(DiagnosisModel).forEach(key => (Diagnosis[key] = DiagnosisModel[key]));

export const ConfigKey = sequelize.define(
  'config_key',
  ConfigKeyModel.getStructure({ User, Sequelize }),
);
ConfigKey.afterCreate(configKey => {
  const { id, data, ...cKey } = JSON.parse(JSON.stringify(configKey));
  firebase.set('configkeys', id, { ...data, ...cKey, configKeyId: id });
  return new Promise(resolve => resolve(configKey));
});
ConfigKey.afterUpdate(configKey => {
  const { id, data, ...cKey } = JSON.parse(JSON.stringify(configKey));
  firebase.update('configkeys', id, { ...data, ...cKey, configKeyId: id });
  return new Promise(resolve => resolve(configKey));
});
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
  const initUserInterfaceTable = (async () => await UserInterface.sync())();

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
      initUserInterfaceTable,
    ]).then(rslts => resolve(rslts))
      .catch(err => reject(err));
  }).catch(err => {
    reject(err);
  });
});
