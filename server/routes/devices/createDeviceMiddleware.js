import { Device } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Device.create(payload)
    .then(device => done(null, { device }))
    .catch(done);
};
