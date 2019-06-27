import uuid from 'uuidv4';

export const createAppTable = (
  `CREATE TABLE IF NOT EXISTS
      app(
        id UUID PRIMARY KEY,
        info JSON,
        admin_password VARCHAR,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      );`
);

export const initialiseAppData = (pool, cb) => {
  const select = 'SELECT id from app';
  pool.query(select, (err, rslt) => {
    if (err) {
      console.log(select, err);
      return cb && cb(err);
    }

    const insert = 'INSERT INTO app (id, created_date, info) VALUES ($1, $2, $3)';
    console.log(select);
    if (!rslt.rows.length) {
      pool.query(
        insert,
        [uuid(), new Date(), JSON.stringify({})],
        cb
      );
    }
  });
};
