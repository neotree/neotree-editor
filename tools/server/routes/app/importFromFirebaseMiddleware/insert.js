export default (app, req) => (table, data, cb) => {
  const author = req.user ? req.user.id : null;
  const keys = ['author', 'created_date', ...Object.keys(data)];
  const values = [author, new Date(), ...Object.values(data)];
  const q = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${Object.keys(keys).map((key, i) => `$${i + 1}`).join(', ')});`;
  console.log(q);
  app.pool.query(
    q,
    values,
    cb
  );
};
