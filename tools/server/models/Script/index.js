/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createScriptsTable = app => {
  const table = `CREATE TABLE IF NOT EXISTS
      scripts(
        id UUID PRIMARY KEY,
        title VARCHAR(128),
        description VARCHAR(128),
        source VARCHAR(128),
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID NOT NULL,
        FOREIGN KEY (author) REFERENCES users (id)
      )`;
  return app.pool.query(table);
};

export default {
  add: (app, params = {}, callback) => {
    const id = uuidv4();

    app.pool.query(
      `INSERT INTO scripts (
        id,
        author,
        title,
        description,
        source,
        created_date
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        params.author,
        params.title,
        params.description,
        params.source || 'editor',
        new Date()
      ],
      err => {
        if (err) {
          app.logger.log('ERROR: add script:', err);
          return callback(err);
        }
        app.pool.query(
          'SELECT * from scripts WHERE "id"=$1',
          [id],
          callback
        );
      }
    );
  }
};
