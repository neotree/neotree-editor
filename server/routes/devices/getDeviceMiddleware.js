import { Device, } from '../../database';
import { firebaseAdmin } from '../../firebase';

function makeid(chars = '', length = 4) {
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result.toUpperCase();
}

module.exports = () => (req, res, next) => {
  (async () => {
    const { deviceId } = req.query;

    const done = (e, payload) => {
      res.locals.setResponse(e, payload);
      next();
    };

    if (!deviceId) return done(new Error('"deviceId" is not provided'));

    let device = null;
    try {
      device = await Device.findOrCreate({
        where: { device_id: deviceId },
        defaults: {
          device_id: deviceId,
          device_hash: makeid(deviceId),
          details: JSON.stringify({ scripts_count: 0, }),
        },
      });
    } catch (e) { /* Do nothing */ }

    try { await firebaseAdmin.database().ref(`devices/${deviceId}`).set(device); } catch (e) { /* Do nothing */ }

    done(null, { device });
  })();
};
