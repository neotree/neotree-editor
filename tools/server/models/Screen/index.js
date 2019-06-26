/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createScreensTable = app => {
  const table = `CREATE TABLE IF NOT EXISTS
      screens(
        id UUID PRIMARY KEY,
        action_text VARCHAR(128),
        content_text VARCHAR(128),
        notes VARCHAR(128),
        condition VARCHAR(128),
        info_text VARCHAR(128),
        epic_id VARCHAR(128),
        ref_id VARCHAR(128),
        title VARCHAR(128),
        source VARCHAR(128),
        step VARCHAR(128),
        story_id VARCHAR(128),
        section_title VARCHAR(128),
        type VARCHAR(128),
        metadata: JSON,
        order: INT NOT NULL,
        position: INT NOT NULL,
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
      `INSERT INTO screens (
        id,
        author,
        script_id,
        actions_text,
        epic_id,
        title,
        source,
        story_id,
        section_title,
        type,
        metadata,
        created_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        params.author,
        params.scriptId,
        params.actions_text,
        params.epic_id,
        params.title,
        params.source,
        params.story_id,
        params.section_title,
        params.type,
        params.metadata,
        new Date()
      ],
      err => {
        if (err) {
          app.logger.log('ERROR: add diagnosis:', err);
          return callback(err);
        }
        app.pool.query(
          'SELECT * from screens WHERE "id"=$1',
          [id],
          callback
        );
      }
    );
  }
};
