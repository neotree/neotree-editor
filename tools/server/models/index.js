import { createUsersTable, createUserProfilesTable } from './User';
import { createScriptsTable } from './Script';
import { createDiagnosisTable } from './Diagnosis';
import { createScreensTable } from './Screen';

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
    createScriptsTable(app),
    createDiagnosisTable(app),
    createScreensTable(app),
  ]).then(rslts => cb(null, rslts)).catch(err => cb(err));
};
