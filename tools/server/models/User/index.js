/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';
import encryptPassword from '../encryptPassword';

export const createUsersTable = app => {
  const table = `CREATE TABLE IF NOT EXISTS
      users(
        id UUID PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;
  return app.pool.query(table);
};

export const createUserProfilesTable = app => {
  const table = `CREATE TABLE IF NOT EXISTS
      user_profiles(
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        profile_name VARCHAR(128) NOT NULL,
        firstname VARCHAR(128),
        lastname VARCHAR(128),
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`;
  return app.pool.query(table);
};

const find = table => (...args) => {
  const app = args[0];
  const criteria = args[1] || {};
  const _select = args.length > 3 ? args[2] : null;
  const cb = args.length > 3 ? args[3] : args[2];

  const condition = Object.keys(criteria).map(key => `"${key}"=${criteria[key]}`).join(' ');

  const query = `SELECT ${_select || 'id'} from ${table} WHERE ${condition}`;
  app.pool.query(query, (err, rslts) => cb(err, rslts));
};

export default {
  findUser: (...args) => find('users')(...args),

  findUsers: (...args) => find('users')(...args),

  findProfile: (...args) => find('user_profiles')(...args),

  findProfiles: (...args) => find('user_profiles')(...args),

  add: (app, { username, password }, callback) => {
    const emailSplit = username.split('@');
    let profile_name = `${emailSplit[0]}`.toLowerCase();

    //1. check if username is registered.
    Promise.all([
      app.pool.query('SELECT id from "users" WHERE "email"=$1', [username]),
      app.pool.query('SELECT id from "user_profiles" WHERE "profile_name"=$1', [profile_name]),
    ]).then(([countUsersWithEmail, countProfilesWithProfileName]) => {
      if (countUsersWithEmail.rows[0]) return callback({ msg: 'Username is taken.' });

      //2. encrypt password
      encryptPassword(password, (err, encryptedPassword) => {
        if (err) return callback(err);

        const userId = uuidv4();
        const profileId = uuidv4();

        profile_name = countProfilesWithProfileName.rows[0] ?
          `${profile_name}-${profileId}` : profile_name;

        //3. Insert user
        app.pool.query(
          'INSERT INTO users (id, email, password, created_date) VALUES ($1, $2, $3, $4)',
          [userId, username, encryptedPassword, new Date()],
          (err) => {
            if (err) {
              app.logger.log('ERROR: add user:', err);
              return callback(err);
            }

            app.pool.query(
              'INSERT INTO user_profiles (id, email, user_id, profile_name, created_date) VALUES ($1, $2, $3, $4, $5)',
              [profileId, username, userId, profile_name, new Date()],
              (err) => {
                if (err) {
                  app.logger.log('ERROR: add user profile:', err);
                  return callback(err);
                }
                Promise.all([
                  app.pool.query(
                    'SELECT * from users WHERE "id"=$1',
                    [userId]
                  ),
                  app.pool.query(
                    'SELECT * from user_profiles WHERE "id"=$1',
                    [profileId]
                  )
                ]).then(([user, profile]) => callback(null, user, profile))
                  .then(err => callback(err));
              }
            );
          }
        );
      });
    }).catch(err => {
      if (err) {
        app.logger.log('ERROR: count users with email & profiles with profile_name:', err);
        return callback(err);
      }
    });
  }
};
