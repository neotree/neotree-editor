# NeoTree Web Editor

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

***

# Server setup

## Git
`sudo apt update`

`sudo apt install git`

`git config --global user.name "Your Name"`

`git config --global user.email "youremail@domain.com"`

**Setup Github SSH**

https://docs.github.com/en/enterprise-server@3.0/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account

## Set global enviroment variables
`sudo nano /etc/enviroment`

Paste **`NODE_ENV="production"`** and save.
 
`source /etc/enviroment`

## Postgres
https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart

## NodeJS
Install nodejs https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-10
 
Replace **14.x** with your preferred version string (if different).

`cd ~`

`curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh`

`sudo bash nodesource_setup.sh`

`sudo apt install nodejs`
 
## Install pm2
`sudo npm install pm2 -g`

`sudo pm2 startup`

## Nginx
Install nginx https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04
