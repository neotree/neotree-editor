import uuid from 'uuidv4';

export default {
  get: (pool, table, { select, where }, cb) => {
    select = select || ['*'];
    const keys = Object.keys(where);
    const values = Object.values(where);
    where = !keys.length ? '' : `WHERE ${keys.map((key, i) => `"${key}"=$${i + 1}`).join(', ')}`;
    const q = `SELECT ${select.join(', ')} from ${table} ${where};`.trim();
    console.log(q);
    pool.query(q, values, cb);
  },

  add: (pool, table, { id, ...data }, cb) => {
    id = id || uuid();
    const keys = ['id', ...Object.keys(data)];
    const values = [id, ...Object.values(data)];
    const q = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${Object.keys(keys).map((key, i) => `$${i + 1}`).join(', ')});`;
    console.log(q);
    pool.query(
      q,
      values,
      cb
    );
  }
};
