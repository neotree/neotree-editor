import path from 'path';
import fs from 'fs';
import cheerio from 'cheerio';
import { firebase, firebaseAdmin, firebaseOptions } from './firebase';

module.exports = () => (req, res) => {
  (async () => {
    const authenticated = firebase.auth().currentUser;
    let user = null;

    if (authenticated) {
      try {
        user = await new Promise((resolve) => {
          firebaseAdmin.database().ref(`users/${authenticated.uid}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }
    }

    const html = fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8');
    const $ = cheerio.load(html);
    const $APP = JSON.stringify({
      authenticatedUser: !user ? null : { ...user },
      firebaseConfig: firebaseOptions,
      app_name: process.env.APP_NAME,
      app_slug: process.env.APP_SLUG,
      app_url: process.env.APP_URL,
    }, null, 4);
    $('head').append(`<script type="text/javascript">\n    const $APP = ${$APP};\n</script>\n`);
    res.send($.html());
  })();
};
