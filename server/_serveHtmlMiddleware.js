import path from 'path';
import fs from 'fs';
import cheerio from 'cheerio';
import { User } from './database/models';

module.exports = () => (req, res) => {
  (async () => {
    let user = null;
    if (req.isAuthenticated()) {
      try {
        user = await User.findOne({ where: { email: req.user.email } });
        if (user) {
          user = JSON.parse(JSON.stringify(user));
          delete user.password;
        }
      } catch (e) { /* Do nothing */ }
    }

    const html = fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8');
    const $ = cheerio.load(html);
    const $APP = JSON.stringify({
      authenticatedUser: user,
      app_name: process.env.APP_NAME,
      app_slug: process.env.APP_SLUG,
      app_url: process.env.APP_URL,
      viewMode: req.session.viewMode || 'view',
    }, null, 4);
    $('head').append(`<script type="text/javascript">\n    const $APP = ${$APP};\n</script>\n`);
    res.send($.html());
  })();
};
