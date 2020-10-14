import path from 'path';
import fs from 'fs';
import cheerio from 'cheerio';
import { User } from './database';

module.exports = () => (req, res) => {
  (async () => {
    let user = null;
    try {
      user = !req.isAuthenticated() ? null : await User.findOne({ where: { id: req.user.id, } });
      if (user) {
        user = JSON.parse(JSON.stringify(user));
        delete user.password;
      }
    } catch (e) { /* Do nothing */ }
    const html = fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8');
    const $ = cheerio.load(html);
    const $APP = JSON.stringify({
      authenticatedUser: !user ? null : { ...user },
      app_name: process.env.APP_NAME,
      app_slug: process.env.APP_SLUG,
      app_url: process.env.APP_URL,
    });
    $('head').append(`<script type="text/javascript">const $APP = ${$APP};</script>`);
    res.send($.html());
  })();
};
