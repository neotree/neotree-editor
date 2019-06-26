import fs from 'fs';
import path from 'path';

const directory = path.resolve(__dirname, '../../tmp_uploads/');

export const deleteTmpUploads = cb => fs.readdir(directory, (err, files) => {
  if (err) throw err;
  for (const file of files) {
    fs.unlink(path.join(directory, file), err => {
      if (err) throw err;
      cb();
    });
  }
});

export default () => (req, res, next) => {
  deleteTmpUploads(next);
};
