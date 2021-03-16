import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, hospitals) => {
      res.locals.setResponse(err, { hospitals });
      next();
    };

    try {
      const hospitals = await Hospital.findAll({ where: { deletedAt: null } });
      done(null, hospitals || []);
    } catch (e) { return done(e); }
  })();
};
