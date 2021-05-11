# NeoTree Web Editor

[Server enviroment setup](https://raw.githubusercontent.com/neotree/neotree-editor/master/documentation/SERVER_SETUP.md "Server setup").

***

App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

## Setup

`git clone https://github.com/neotree/neotree-editor.git`

## Server configuration

- Create file: `.env`
- Copy and paste the content in `.env-example` into the new file 
- Change the `.env` values to your needs

**Get `Firebase SDK` from values: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk**

**Get `Firebase Admin SDK` from values: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk**

## Scripts

* `npm install` - install dependencies
* `npm start` - run development server
* `npm run build` - build app for deployment
* `npm run prod-server` - run production server
* `npm run stage-server` - run production (stage) server
