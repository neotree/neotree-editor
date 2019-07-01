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
    password: { type: Sequelize.STRING }
  }),

  add: function ({ username, password }) {
    const Profile = this.Profile;
    const emailSplit = username.split('@');
    let profile_name = `${emailSplit[0]}`.toLowerCase();

    return new Promise((resolve, reject) => {
      Promise.all([
        this.count({ where: { email: username } }),
        Profile ? Profile.count({ where: { profile_name } }) : null
      ]).then(([countUsersWithEmail, countProfilesWithProfileName]) => {
        if (countUsersWithEmail) return reject({ msg: 'Username is taken.' });

        //2. encrypt password
        encryptPassword(password, (err, encryptedPassword) => {
          if (err) return reject(err);

          const userId = uuid();
          const profileId = uuid();

          profile_name = countProfilesWithProfileName ?
            `${profile_name}-${profileId}` : profile_name;

          this.create({
            id: userId,
            email: username,
            password: encryptedPassword
          }).then((user) => {
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
