import { Device } from '../../database';

module.exports = () => (req, res, next) => {
  const { deviceId: device_id, ...params } = req.body;

  (async () => {
    let error = null;
    let device = null;

    try {
      device = await Device.findOne({ where: { device_id } });

      let details = null;
      if (device && (typeof device.details === 'string')) details = JSON.parse(device.details);

      params.details = JSON.stringify({ ...details, ...params.details });

      await Device.update(params, { where: { device_id } });

      device = await Device.findOne({ where: { device_id } });
    } catch (e) { error = e; }

    res.locals.setResponse(error, { device });
    next();
  })();
};
