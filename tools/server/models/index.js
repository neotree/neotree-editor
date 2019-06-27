import { createUsersTable, createUserProfilesTable } from './User';
import { createScriptsTable } from './Script';
import { createDiagnosisTable } from './Diagnosis';
import { createScreensTable } from './Screen';
import { createFilesTable } from './File';
import { createConfigKeysTable } from './ConfigKey';

const createTables = (app, cb) => (...args) => {
  const last = args.length - 1;
  const rslts = [];
  const errors = [];

  const run = (counter = 0) => {
    const q = args[counter];
    const finish = () => {
      if (counter === last) {
        return cb && cb(
          errors.length ? errors : null,
          errors.length ? null : rslts,
        );
      }
      run(counter + 1);
    };

    if (q) {
      app.pool.query(q).then(rslt => { rslts.push(rslt); finish(); })
        .catch(err => {
          console.log(counter, err); // eslint-disable-line
          errors.push(err);
          finish();
        });
    }
  };

  run();
};

export default (app, cb) => {
  createTables(app, cb)(
    `CREATE TABLE IF NOT EXISTS
      session(
        sid character varying NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) without time zone NOT NULL
      );`,
    createUsersTable,
    createFilesTable,
    createUserProfilesTable,
    createScriptsTable,
    createDiagnosisTable,
    createScreensTable,
    createConfigKeysTable,
  );
};
