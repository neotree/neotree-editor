require('dotenv').config({ path: process.env.ENV_FILE || './.env' }); // enviroment variables

require('./server'); // server
