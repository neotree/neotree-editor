import bcrypt from 'bcryptjs';

export default (password, callback) => bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) return callback(err);
    callback(null, hash);
  });
});
