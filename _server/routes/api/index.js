import express from 'express';
import { ApiKey } from '../../models';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/key',
    (req, res, next) => {
      ApiKey.findOne({ where: {} })
        .then((apiKey) => {
          res.locals.setResponse(null, { apiKey });
          next();
        })
        .catch(e => {
          res.locals.setResponse(e);
          next();
        });
    },
    responseMiddleware
  );

  router.post(
    '/generate-key',
    (req, res, next) => {
      const { apiKey } = req.body;
      const getRandString = () => Math.random().toString(36).substring(2).toUpperCase();

      const key = `${getRandString()}${getRandString()}${getRandString()}`;

      (apiKey ?
        ApiKey.update({ key }, { where: { id: apiKey.id }, individualHooks: true })
        :
        ApiKey.create({ key })
      ).then((apiKey) => {
          res.locals.setResponse(null, { apiKey });
          next();
        })
        .catch(e => {
          res.locals.setResponse(e);
          next();
        });
    },
    responseMiddleware
  );

  return router;
};
