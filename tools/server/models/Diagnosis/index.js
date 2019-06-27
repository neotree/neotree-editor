export const createDiagnosisTable = (
  `CREATE TABLE IF NOT EXISTS
      diagnoses(
        id UUID PRIMARY KEY,
        data JSON,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        author UUID,
        script_id UUID NOT NULL,
        FOREIGN KEY (author) REFERENCES users (id),
        FOREIGN KEY (script_id) REFERENCES scripts (id)
      );`
);
