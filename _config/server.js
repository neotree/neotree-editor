const serverType = process.env.NEOTREE_SERVER_TYPE;

let firebaseConfigFileName = process.env.NEOTREE_FIREBASE_CONFIG_FILE;
let serverConfigFileName = process.env.NEOTREE_CONFIG_FILE;

if (serverType === 'production') {
  firebaseConfigFileName = process.env.NEOTREE_PRODUCTION_FIREBASE_CONFIG_FILE;
  serverConfigFileName = process.env.NEOTREE_PRODUCTION_CONFIG_FILE;
}

if (serverType === 'stage') {
  firebaseConfigFileName = process.env.NEOTREE_STAGE_FIREBASE_CONFIG_FILE;
  serverConfigFileName = process.env.NEOTREE_STAGE_CONFIG_FILE;
}

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
