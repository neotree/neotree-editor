import { Device } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Device.findAll({ where: payload })
    .then(devices => done(null, { devices }))
    .catch(done);
};
