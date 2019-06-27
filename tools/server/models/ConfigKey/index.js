export const createConfigKeysTable = (
  `CREATE TABLE IF NOT EXISTS
      config_keys(
        id UUID PRIMARY KEY,
        data JSON,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID,
        FOREIGN KEY (author) REFERENCES users (id)
      );`
);
