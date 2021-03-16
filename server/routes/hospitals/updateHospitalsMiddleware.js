import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { hospitals } = req.body;

    const done = (err, rslts = []) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      res.locals.setResponse(null, { updatedHospitals: rslts.map(rslt => rslt[1]) });
      next();
    };

    try {
      const updatedHospitals = await Promise.all(hospitals.map(({ id, ...payload }) =>
        Hospital.update(payload, { where: { id }, returning: true, plain: true, })));
      done(null, updatedHospitals);
    } catch (e) { return done(e); }
  })();
};
