import uuidv4 from 'uuidv4';
import encryptPassword from '../encryptPassword';

export const createUsersTable = pool => {
  const table = `CREATE TABLE IF NOT EXISTS
      users(
        id UUID PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;
  return pool.query(table);
};

export const createUserProfilesTable = pool => {
  const table = `CREATE TABLE IF NOT EXISTS
      userProfiles(
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        profileName VARCHAR(128) NOT NULL,
        firstname VARCHAR(128),
        lastname VARCHAR(128),
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`;
  return pool.query(table);
};

const find = table => (...args) => {
  const pool = args[0];
  const criteria = args[1] || {};
  const _select = args.length > 3 ? args[2] : null;
  const cb = args.length > 3 ? args[3] : args[2];

  const condition = Object.keys(criteria).map(key => `"${key}"=${criteria[key]}`).join(' ');

  const query = `SELECT ${_select || 'id'} from ${table} WHERE ${condition}`;
  pool.query(query, (err, rslts) => cb(err, rslts));
};

export default {
  findUser: (...args) => find('users')(...args),
  findUsers: (...args) => find('users')(...args),
  findProfile: (...args) => find('userProfiles')(...args),
  findProfiles: (...args) => find('userProfiles')(...args),
  add: (pool, { username, password }, callback) => {
    const emailSplit = username.split('@');
    let profileName = `${emailSplit[0]}`.toLowerCase();

    //1. check if username is registered.
    Promise.all([
      pool.query(`SELECT id from "users" WHERE "email"=${username}`),
      pool.query(`SELECT id from "userProfiles" WHERE "profileName"=${profileName}`),
    ]).then(([countUsersWithEmail, countProfilesWithProfileName]) => {
      if (countUsersWithEmail.rows[0]) return callback({ msg: 'Username is taken.' });

      //2. encrypt password
      encryptPassword(password, (err, encryptedPassword) => {
        if (err) return callback(err);

        const userId = uuidv4();
        const profileId = uuidv4();

        profileName = countProfilesWithProfileName.rows[0] ?
          `${profileName}-${profileId}` : profileName;

        //3. Insert user
        pool.query(
          'INSERT INTO users (id, email, password, created_date) VALUES ($1, $2, $3, $4)’',
          [userId, username, encryptedPassword, new Date().getTime()],
          (err, user) => {
            if (err) return callback(err);

            pool.query(
              'INSERT INTO userProfiles (id, email, user_id, profileName, created_date) VALUES ($1, $2, $3, $4, $5)’',
              [profileId, username, userId, profileName, new Date().getTime()],
              (err, profile) => {
                if (err) return callback(err);

                callback(null, user, profile);
              }
            );
          }
        );
      });
    }).catch(err => callback(err));
  }
};
