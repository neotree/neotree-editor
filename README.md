# NeoTree Web Editor

App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

## Setup

`git clone https://github.com/neotree/neotree-editor.git`

## Server configuration

`server.config.json`

```javascript
{
  "port": "PORT",
  "host": "http://yourwebsite.com",
  "database": {
    "username": "db_username",
    "database": "db_name",
    "password": "db_password",
    "port": "db_port",
    "host": "db_host"
  }
}
```

`firebase.config.json`

https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk

### Configure development server

If `export NEOTREEconfig_FILE=/path/to/server.config.json` is set, then `/path/to/server.config.json` will be used as the server config file, otherwise add the config file to project folder: `config/server.config.json`

If `export NEOTREEconfig_FILE=/path/to/server.config.json` is set, then `/path/to/server.config.json` will be used as the server config file, otherwise add the config file to project folder: `config/server.config.json`

### Configure production server

If `export NEOTREE_FIREBASEconfig_FILE=/path/to/firebase.config.json` is set, then `/path/to/firebase.config.json` will be used as the server config file, otherwise add the config file to the project folder: `dist/config/firebase.config.json`

If `export NEOTREE_FIREBASEconfig_FILE=/path/to/firebase.config.json` is set, then `/path/to/firebase.config.json` will be used as the firebase config file, otherwise add the firebase config file to the project folder: `dist/config/firebase.config.json`

**enviroment variables for `npm run prod-server` config files must be prefixed `NEOTREE_PRODUCTION_`
**enviroment variables for `npm run stage-server` config files must be prefixed `NEOTREE_STAGE_`

**dist/config is a public folder, for better security use enviroment variables**

## Scripts

* `npm install` - install dependencies
* `npm start` - run development server
* `npm run build` - build app for deployment
* `npm run dist` - run production server
* `npm run prod-server` - run production server (looks for config files prefixed `NEOTREE_PRODUCTION_`)
* `npm run stage-server` - run production (stage) server (looks for config files prefixed `NEOTREE_STAGE_`)
