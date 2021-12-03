# Neotree Web Editor

[![DOI](https://zenodo.org/badge/307626495.svg)](https://zenodo.org/badge/latestdoi/307626495)

Note that this project is part of the overall [Neotree System](https://github.com/neotree/neotree), an open source technology platform for supporting health care workers provide neonatal care in low resource settings. For more information see the [main repo](https://github.com/neotree/neotree).

Instructions on how to use the web editor once it has been setup can be found [here](https://github.com/neotree/neotree-editor/blob/master/editor-usage-instructions.pdf).

[Server enviroment setup](https://github.com/neotree/neotree-editor/tree/master/documentation/server_enviroment "Server setup").

---

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

- `npm install` - install dependencies
- `npm start` - run development server
- `npm run build` - build app for deployment
- `npm run prod-server` - run production server
- `npm run stage-server` - run production (stage) server
