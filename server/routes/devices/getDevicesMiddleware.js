import { Device } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Device.findAll({ where: payload })
    .then(devices => done(null, { devices }))
    .catch(done);
};
