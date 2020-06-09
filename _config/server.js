let serverType = process.env.NEOTREE_SERVER_TYPE || '';

if (serverType) serverType = `${serverType.toUpperCase()}_`;

const firebaseConfigFileName = `${serverType}NEOTREE_FIREBASE_CONFIG_FILE`;
const serverConfigFileName = `${serverType}NEOTREE_CONFIG_FILE`;

const firebaseConfig = (function () {
  try {
    return require(process.env[firebaseConfigFileName]);
  } catch (e) {
    return require('./firebase.config.json');
  }
}());

try {
  module.exports = {
    firebaseConfig,
    ...require(process.env[serverConfigFileName])
  };
} catch (e) {
  module.exports = {
    firebaseConfig,
    ...require('./server.config')
  };
}
