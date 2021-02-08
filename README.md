# NeoTree Web Editor

App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

## Setup

`git clone https://github.com/neotree/neotree-editor.git`

## Server configuration

- Create file: `.env`.
- Copy and paste the content in `.env-example` into the new file. 
- Change the values to your needs.

## Scripts

* `npm install` - install dependencies
* `npm start` - run development server
* `npm run build` - build app for deployment
* `npm run dist` - run production server
* `npm run prod-server` - run production server (looks for config files prefixed `NEOTREE_PRODUCTION_`)
* `npm run stage-server` - run production (stage) server (looks for config files prefixed `NEOTREE_STAGE_`)
