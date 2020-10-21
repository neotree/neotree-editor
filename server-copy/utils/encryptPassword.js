import bcrypt from 'bcryptjs';

export default function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(password, salt, (err, encryptedPassword) => {
        if (err) return reject(err);
        resolve(encryptedPassword);
      });
    });
  });
}
