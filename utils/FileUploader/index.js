import uuid from 'uuidv4';

export default class Upload {
  constructor(file, opts = {}) {
    const { url, metadata, fieldname, preserveFilename, ...options } = opts;
    if (!file) throw new Error('MISSING: file!');
    if (!url) throw new Error('MISSING: url!');
    this.file = file;
    this.fieldname = fieldname || 'file';
    this.options = options;
    this.metadata = metadata || {};
    this.preserveFilename = preserveFilename;
    this.url = url;
  }

  upload() {
    return new Promise((resolve, reject) => {
      if (!this.file) return reject(new Error('File is required!'));
      const startUploading = () => {
        this._initRequest();
        this._initListeners(resolve, reject);
        this._sendRequest();
      };

      if (this.file.type.match('image')) {
        this.readImage((err, opts) => {
          this.metadata = Object.assign({}, this.metadata, opts);
          startUploading();
        });
      } else {
        startUploading();
      }
    });
  }

  abort() { if (this.xhr) this.xhr.abort(); }

  _initRequest = () => {
    const xhr = this.xhr = new global.XMLHttpRequest();
    xhr.open('POST', this.url, true);
    xhr.responseType = 'json';
  };

  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    xhr.addEventListener('error', this.options.onError || (() => reject({
      msg: 'Failed to upload',
      status: xhr.status,
      statusText: xhr.statusText
    })));
    xhr.addEventListener('abort', this.options.onAbort || (() => reject()));
    xhr.addEventListener('progress', this.options.onProgress);
    xhr.addEventListener('readystatechange', () => {
      if ((xhr.readyState === 4) && (xhr.status === 200)) resolve(xhr.response);
    });
  }

  _sendRequest() {
    const data = new global.FormData();
    data.append(this.fieldname, this.file);
    data.append('metadata', this.metadata);
    data.append('filename', this.preserveFilename ? this.file.name : `${uuid()}-${this.file.name}`);
    this.xhr.send(data);
  }

  readImage(cb) {
    const reader = new global.FileReader();
    reader.onerror = cb;
    reader.onload = e => {
      const img = new global.Image();
      img.src = e.target.result;
      img.onerror = cb;
      img.onload = () => cb(null, {
        width: img.width,
        height: img.height
      });
    };
    reader.readAsDataURL(this.file);
    return;
  }
}
