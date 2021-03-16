import { Hospital } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { hospitals, } = req.body;

    const done = (err, rslts = []) => {
      res.locals.setResponse(err, { hospitals: rslts });
      next();
    };

    const deletedAt = new Date();

    try {
      const rslts = await Hospital.update({ deletedAt }, { where: { id: hospitals.map(s => s.id) } });
      done(null, rslts);
    } catch (e) { return done(e); }
  })();
};
