import express from 'express';
import stream from 'stream';
import { File } from '../../models';

let router = express.Router();

module.exports = app => {
  // const { responseMiddleware } = app;

  router = require('./uploadFileMiddleware')(router, app);

  router.get(
    '/file/:fileId',
    (req, res) => {
      File.findOne({ where: { id: req.params.fileId } })
        .catch(e => res.json({ error: e }))
        .then(file => {
          const fileContents = Buffer.from(file.data, 'base64');
          const readStream = new stream.PassThrough();
          readStream.end(fileContents);

          // res.set('Content-disposition', `attachment; filename=${file.filename}`);
          // res.set('Content-Type', file.content_type);

          readStream.pipe(res);
        });
    },
  );

  return router;
};
