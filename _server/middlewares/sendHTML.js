import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs';

module.exports = () => (req, res) => {
  const { app, ...payload } = res.locals.getResponsePayload() || {};
  const error = res.locals.getResponseError();

  const host = `${req.protocol}://${req.headers.host}`;

  const __$APP__ = JSON.stringify({
    host,
    ...payload,
    ...app,
    ...(error ? { error } : {})
  });

  const html = fs.readFileSync(path.resolve(__dirname, '../../src/index.html'), 'utf8');
  const $ = cheerio.load(html);

  $('head').append(`<script type="text/javascript">const __$APP__ = ${__$APP__};</script>`);
  $('body').append(`<script type="text/javascript" src="${host}/bundle.js"></script>`);
  res.send($.html());
};
