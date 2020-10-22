import { updateHospital } from './updateHospitalMiddleware';

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { hospitals } = req.body;

    const done = (err, updatedHospitals) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      app.io.emit('update_config_keys', { key: app.getRandomString(), hospitals: hospitals.map(s => ({ hospitalId: s.hospitalId })) });
      res.locals.setResponse(null, { updatedHospitals });
      next();
    };

    let updatedHospitals = [];
    try { updatedHospitals = await Promise.all(hospitals.map(s => updateHospital(s))); } catch (e) { return done(e); }

    done(null, updatedHospitals);
  })();
};
