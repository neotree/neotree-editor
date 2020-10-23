import { validationResult } from 'express-validator/check';
import bcrypt from 'bcryptjs';
import { User } from '../../database/models';

const encryptPassword = password => new Promise((resolve, reject) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
});

module.exports = () => (req, res, next) => {
  (async () => {
    const { password, username, } = req.body;

    const done = ((err, rslts) => {
      res.locals.setResponse(err, rslts);
      next(); return null;
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) done(errors.array());

    let encryptedPassword = null;
    try { encryptedPassword = await encryptPassword(password); } catch (e) { return done(e); }

    try {
      await User.update({ password: encryptedPassword }, { where: { email: username }, individualHooks: true });
    } catch (e) { return done(e); }

    let user = null;
    try { user = await User.findOne({ where: { email: username } }); } catch (e) { return done(e); }

    req.logIn(user, err => {
      if (err) done(err);
      done(null, { user });
    });
  })();
};
