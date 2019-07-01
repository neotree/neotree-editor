import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs';

module.exports = expressApp => (req, res) => {
  const config = expressApp.config;
  const { app, ...payload } = res.locals.getResponsePayload() || {};
  const error = res.locals.getResponseError();
  
  const __$INITIAL_DATA__ = JSON.stringify({
    host: config.host,
    ...payload,
    ...app,
    ...(error ? { error } : {})
  });

  const html = fs.readFileSync(path.resolve(__dirname, '../../src/index.html'), 'utf8');
  const $ = cheerio.load(html);
  $('head').append(`<script type="text/javascript">const __$INITIAL_DATA__ = ${JSON.stringify(__$INITIAL_DATA__)};</script>`);
  $('body').append(`<script type="text/javascript" src="${config.host}/bundle.js"></script>`);
  res.send($.html());
};
