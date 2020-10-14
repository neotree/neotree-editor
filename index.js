require('dotenv').config({ path: process.env.ENV_FILE || './.env' }); // enviroment variables

// server
if (process.env.NODE_ENV === 'production') {
  require('./dist/server');
} else {
  require('./server');
}
