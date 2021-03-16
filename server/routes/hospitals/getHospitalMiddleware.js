import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { id } = req.query;

    const done = (err, hospital) => {
      res.locals.setResponse(err, { hospital });
      next();
    };

    try {
      const hospital = await Hospital.findOne({ where: { id } });
      done(null, hospital);
    } catch (e) { return done(e); }
  })();
};
