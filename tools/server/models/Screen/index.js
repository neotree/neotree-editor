export const createScreensTable = (
  `CREATE TABLE IF NOT EXISTS
      screens(
        id UUID PRIMARY KEY,
        data JSON,
        type VARCHAR,
        position INT,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID,
        script_id UUID,
        FOREIGN KEY (author) REFERENCES users (id),
        FOREIGN KEY (script_id) REFERENCES scripts (id)
      );`
);
