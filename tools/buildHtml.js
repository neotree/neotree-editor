// This script copies public/index.html into /dist/index.html
// This is a good example of using Node and cheerio to do a simple file transformation.
// In this case, the transformation is useful since we only use a separate css file in prod.
/*eslint-disable import/no-extraneous-dependencies*/
import fs from 'fs';
import cheerio from 'cheerio';
import 'colors';
import path from 'path';
import ncp from 'ncp';

/*eslint-disable no-console */

fs.readFile('src/index.html', 'utf8', (err, markup) => {
  if (err) {
    return console.log(err);
  }

  const $ = cheerio.load(markup);

  // since a separate spreadsheet is only utilized for the production build, need to dynamically add this here.
  // $('head').prepend('<link rel="stylesheet" href="style.css"/>');

  fs.writeFile('dist/src/index.html', $.html(), 'utf8', (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('index.html written to /dist/src'.green);
  });
});

// copy assets folder
ncp(path.resolve(__dirname, '../src/assets'), path.resolve(__dirname, '../dist/src/assets'), err => {
   if (err) return console.error(err);
   console.log('Assets folder copied to /dist/src/assets'.green);
  }
);
