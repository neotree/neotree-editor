import uuid from 'uuidv4';
import bcrypt from 'bcryptjs';
import { User, UserProfile } from '../../database';

const encryptPassword = (password, callback) => bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) return callback(err);
    callback(null, hash);
  });
});

export default function addUser({ role, id, username, password }) {
  const emailSplit = username.split('@');
  let profile_name = `${emailSplit[0]}`.toLowerCase();

  return new Promise((resolve, reject) => {
    Promise.all([
      User.count({ where: { email: username } }),
      UserProfile.count({ where: { profile_name } })
    ]).then(([countUsersWithEmail, countProfilesWithProfileName]) => {
      if (!id && countUsersWithEmail) return reject({ msg: 'Username is taken.' });

      //2. encrypt password
      encryptPassword(password, (err, encryptedPassword) => {
        if (err) return reject(err);

        const userId = id || uuid();
        const profileId = uuid();

        profile_name = countProfilesWithProfileName ?
          `${profile_name}-${profileId}` : profile_name;

        const promise = id ?
          new Promise((resolve, reject) => {
            User.update({ password: encryptedPassword }, { where: { id }, individualHooks: true })
              .then(() => User.findOne({ where: { id } })
                .then(resolve)
                .catch(reject))
              .catch(reject);
          })
          :
          User.create({
            id: userId,
            role: role || 0,
            email: username,
            password: encryptedPassword
          });

        promise.then((user) => {
          // resolve user if no Profile model is supplied

          return UserProfile.create({
            id: profileId,
            email: username,
            user_id: userId,
            profile_name
          }).then((profile) => {
            resolve({ user, profile });
          })
            .catch(err => reject(err));
        }).catch(err => reject(err));
      });
    })
    .catch(err => reject(err));
  });
}
