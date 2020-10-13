import { Device } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Device.findOne({ where: payload })
    .then(device => done(null, { device }))
    .catch(done);
};
