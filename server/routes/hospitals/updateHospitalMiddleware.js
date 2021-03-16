import { Hospital } from '../../database/models';

export default () => (req, res, next) => {
  const { id, ...payload } = req.body;

  (async () => {
    const done = (err, hospital) => {
      res.locals.setResponse(err, { hospital });
      next();
    };

    try {
      const rslt = await Hospital.update(payload, { where: { id }, returning: true, plain: true, });
      done(null, rslt ? rslt[1] : null);
    } catch (e) { return done(e); }
  })();
};
