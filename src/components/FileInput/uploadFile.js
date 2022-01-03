/* global window, FormData, fetch */

export default function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file, file.filename);

      fetch('/upload-file', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(({ file: f, error: e, errors, }) => {
        e = (e ? [e] : (errors ? errors : [])).join('\n');
        if (e) return reject(e);
        resolve({
          type: f.content_type,
          size: f.size,
          filename: f.filename,
          fileId: f.id,
          data: `${window.location.origin}/file/${f.id}`,
        });
      })
      .catch(reject);
    });
}
