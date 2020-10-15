import bcrypt from 'bcryptjs';
import { User } from '../database';

const encryptPassword = (password) => new Promise((resolve, reject) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
});

module.exports = function addOrUpdateUser({ id, username, password, ...userParams }) {
  if (username) userParams.email = userParams.email || username;

  return new Promise((resolve, reject) => {
    (async () => {
      if (password) {
        try { userParams.password = await encryptPassword(password); } catch (e) { return reject(e); }
      }

      if (id) {
        try {
          await User.update(userParams, { where: { id }, individualHooks: true });
        } catch (e) { return reject(e); }

        try {
          const updatedUser = await User.findOne({ where: { id } });
          resolve(updatedUser);
        } catch (e) { return reject(e); }

        return;
      }

      if (userParams.email) {
        try {
          const countUsersWithEmail = await User.count({ where: { email: userParams.email } });
          if (countUsersWithEmail) return reject({ msg: 'Username is taken.' });
        } catch (e) {
          return reject(e);
        }
      } else {
        return reject({ msg: 'Username is required.' });
      }

      try {
        const newUser = await User.create({
          ...userParams,
          role: userParams.role || 0,
        });
        resolve(newUser);
      } catch (e) { reject(e); }
    })();
  });
};
