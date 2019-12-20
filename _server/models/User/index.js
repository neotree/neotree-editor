/* eslint-disable object-shorthand */
import uuid from 'uuidv4';
import encryptPassword from '../encryptPassword';

export default {
  getStructure: ({ Sequelize }) => ({
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: { type: Sequelize.STRING },
    role: { type: Sequelize.INTEGER, defaultValue: 0 }
  }),

  add: function ({ role, id, username, password }) {
    const Profile = this.Profile;
    const emailSplit = username.split('@');
    let profile_name = `${emailSplit[0]}`.toLowerCase();

    return new Promise((resolve, reject) => {
      Promise.all([
        this.count({ where: { email: username } }),
        Profile ? Profile.count({ where: { profile_name } }) : null
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
              this.update({ password: encryptedPassword }, { where: { id }, individualHooks: true })
                .then(() => this.findOne({ where: { id } })
                  .then(resolve)
                  .catch(reject))
                .catch(reject);
            })
            :
            this.create({
              id: userId,
              role: role || 0,
              email: username,
              password: encryptedPassword
            });

          promise.then((user) => {
            // resolve user if no Profile model is supplied

            // add user profile
            if (Profile) {
              return Profile.create({
                id: profileId,
                email: username,
                user_id: userId,
                profile_name
              }).then((profile) => {
                resolve({ user, profile });
              })
                .catch(err => reject(err));
            }
            resolve({ user });
          }).catch(err => reject(err));
        });
      })
      .catch(err => reject(err));
    });
  }
};
