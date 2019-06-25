/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createDiagnosisTable = app => {
  const table = `CREATE TABLE IF NOT EXISTS
      diagnoses(
        id UUID PRIMARY KEY,
        name VARCHAR(128),
        expression VARCHAR(128),
        description VARCHAR(128),
        source VARCHAR(128),
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID NOT NULL,
        script_id UUID NOT NULL,
        FOREIGN KEY (author) REFERENCES users (id),
        FOREIGN KEY (script_id) REFERENCES scripts (id)
      )`;
  return app.pool.query(table);
};

export default {
  add: (app, params = {}, callback) => {
    const id = uuidv4();

    app.pool.query(
      `INSERT INTO diagnoses (
        id,
        author,
        script_id,
        name,
        description,
        expression,
        source,
        created_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        params.author,
        params.scriptId,
        params.name,
        params.description,
        params.expression,
        params.source || 'editor',
        new Date()
      ],
      err => {
        if (err) {
          app.logger.log('ERROR: add diagnosis:', err);
          return callback(err);
        }
        app.pool.query(
          'SELECT * from diagnoses WHERE "id"=$1',
          [id],
          callback
        );
      }
    );
  }
};
