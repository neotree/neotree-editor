import { Diagnosis } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { id } = req.query;

    const done = (err, diagnosis) => {
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    let diagnosis = null;
    try {
      diagnosis = await Diagnosis.findOne({ where: { id } });
      if (diagnosis) {
        const { data, ...s } = JSON.parse(JSON.stringify(diagnosis));
        diagnosis = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, diagnosis);
  })();
};
