import { Device } from '../../database';

module.exports = () => (req, res, next) => {
  const { deviceId: device_id, ...params } = req.body;

  (async () => {
    let error = null;
    let device = null;

    try {
      await Device.update(params, { where: { device_id } });
      device = await Device.findOne({ where: { device_id } });
    } catch (e) { error = e; }

    res.locals.setResponse(error, { device });
    next();
  })();
};
