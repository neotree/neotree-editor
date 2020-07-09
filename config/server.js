let serverType = process.env.NEOTREEserver_TYPE || '';

if (serverType) serverType = `${serverType.toUpperCase()}_`;

const firebaseConfigFileName = `${serverType}NEOTREE_WEBEDITOR_FIREBASEconfig_FILE`;
const serverConfigFileName = `${serverType}NEOTREE_WEBEDITORconfig_FILE`;

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
