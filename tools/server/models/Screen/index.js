/* eslint-disable camelcase*/
import uuidv4 from 'uuidv4';

export const createScreensTable = (
  `CREATE TABLE IF NOT EXISTS
      screens(
        id UUID PRIMARY KEY,
        action_text VARCHAR,
        content_text VARCHAR,
        notes VARCHAR,
        condition VARCHAR,
        info_text VARCHAR,
        epic_id VARCHAR,
        ref_id VARCHAR,
        title VARCHAR,
        source VARCHAR,
        step VARCHAR,
        story_id VARCHAR,
        section_title VARCHAR,
        type VARCHAR,
        metadata JSON,
        position INT,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID,
        script_id UUID,
        FOREIGN KEY (author) REFERENCES users (id),
        FOREIGN KEY (script_id) REFERENCES scripts (id)
      );`
);

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
