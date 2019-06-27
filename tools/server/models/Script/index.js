/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createScriptsTable = (
  `CREATE TABLE IF NOT EXISTS
      scripts(
        id UUID PRIMARY KEY,
        title VARCHAR,
        description VARCHAR,
        source VARCHAR,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID,
        FOREIGN KEY (author) REFERENCES users (id)
      );`
);

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
