import { createUsersTable, createUserProfilesTable } from './User';

export default (app, cb) => {
  Promise.all([
    app.pool.query(
      `CREATE TABLE IF NOT EXISTS
        session(
          sid character varying NOT NULL,
          sess json NOT NULL,
          expire timestamp(6) without time zone NOT NULL
        );`
    ),
    createUsersTable(app),
    createUserProfilesTable(app),
  ]).then(rslts => cb(null, rslts)).catch(err => cb(err));
};
