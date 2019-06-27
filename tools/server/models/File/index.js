/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createFilesTable = (
  `CREATE TABLE IF NOT EXISTS
      files(
        id UUID PRIMARY KEY,
        uploaded_by UUID,
        filename VARCHAR(128),
        content_type VARCHAR(128),
        size BIGINT,
        data BYTEA,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      );`
);

export default {
  add: (app, params = {}, callback) => {
    const id = uuidv4();

    app.pool.query(
      `INSERT INTO files (
        id,
        uploaded_by,
        filename
        contentType
        size
        data
        created_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        params.uploaded_by,
        params.filename,
        params.contentType,
        params.size,
        params.data,
        new Date()
      ],
      err => {
        if (err) {
          app.logger.log('ERROR: add file:', err);
          return callback(err);
        }
        app.pool.query(
          `SELECT (
            id,
            uploaded_by,
            filename,
            contentType,
            size,
            created_date,
            modified_date
          ) from files WHERE "id"=$1`,
          [id],
          callback
        );
      }
    );
  }
};
