import { createUsersTable, createUserProfilesTable } from './User';

export default (pool, cb) => {
  Promise.all([
    createUsersTable(pool),
    createUserProfilesTable(pool),
  ]).then(rslts => cb(null, rslts)).catch(err => cb(err));
};
