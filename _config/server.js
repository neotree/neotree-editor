const serverType = process.env.NEOTREE_SERVER_TYPE;

let firebaseConfigFileName = 'NEOTREE_FIREBASE_CONFIG_FILE';
let serverConfigFileName = 'NEOTREE_CONFIG_FILE';

if (serverType === 'production') {
  firebaseConfigFileName = 'NEOTREE_PRODUCTION_FIREBASE_CONFIG_FILE';
  serverConfigFileName = 'NEOTREE_PRODUCTION_CONFIG_FILE';
}

if (serverType === 'stage') {
  firebaseConfigFileName = 'NEOTREE_STAGE_FIREBASE_CONFIG_FILE';
  serverConfigFileName = 'NEOTREE_STAGE_CONFIG_FILE';
}

const firebaseConfig = (function () {
  try {
    return require(firebaseConfigFileName);
  } catch (e) {
    return require('./firebase.config.json');
  }
}());

try {
  module.exports = {
    firebaseConfig,
    ...require(serverConfigFileName)
  };
} catch (e) {
  module.exports = {
    firebaseConfig,
    ...require('./server.config')
  };
}
