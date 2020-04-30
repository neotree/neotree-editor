const firebaseConfig = (function () {
  try {
    return require(process.env.NEOTREE_FIREBASE_CONFIG_FILE);
  } catch (e) {
    return require('./firebase.config.json');
  }
}());

try {
  module.exports = {
    firebaseConfig,
    ...require(process.env.NEOTREE_CONFIG_FILE)
  };
} catch (e) {
  module.exports = {
    firebaseConfig,
    ...require('./server.config')
  };
}
