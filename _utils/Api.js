/* global XMLHttpRequest */
class ApiFetch {
  constructor(url, options) {
    this.url = url;
    this.method = 'GET';
    this.options = options;
  }

  request = method => new Promise((resolve, reject) => {
    this.method = method;
    this._initRequest();
    this._initListeners(resolve, reject);
    this._sendRequest();
  });

  _initRequest = () => {
    const xhr = this.xhr = new XMLHttpRequest();
    let reqQuery = '';
    if (this.method === 'GET') {
      reqQuery = `?payload=${JSON.stringify({ ...this.options.payload || {} })}`;
    }
    xhr.open(this.method, `${this.url}${reqQuery}`, true);
    xhr.responseType = 'json';
  };

  _initListeners = (resolve, reject) => {
    const xhr = this.xhr;

    xhr.addEventListener('error', e => {
      if (this.options.onError) this.options.onError(e);
      reject(e);
    });

    xhr.addEventListener('abort', () => {
      if (this.options.onAbort) this.options.onAbort();
      reject({ msg: 'Request aborted.' });
    });

    xhr.addEventListener('timeout', e => {
      this.options.onTimeout(e);
      reject({ msg: 'Request timeout.' });
    });

    xhr.addEventListener('load', this.options.onProgress);
    xhr.addEventListener('loadend', this.options.onProgress);
    xhr.addEventListener('loadstart', this.options.onProgress);
    xhr.addEventListener('progress', this.options.onProgress);

    xhr.addEventListener('readystatechange', () => {
      if ((xhr.readyState === 4) && (xhr.status === 200)) resolve(xhr.response);
    });
  };

  _sendRequest = () => this.xhr.send(this.options.payload);
}

const makeApiCall = (method, ...args) => new Promise((resolve, reject) => {
  let _url = null;
  let _options = {};

  if (typeof args[0] === 'string') {
    _url = args[0];
    _options = args[1];
  } else if (args[0] && args[0].url) {
    const { url, ...options } = args[0];
    _url = url;
    _options = options;
  } else {
    return reject({ msg: 'Request url not specified' });
  }

  new ApiFetch(_url, { ..._options, method })
    .request(method)
    .then(resolve)
    .catch(reject);
});

export default {
  get: (...args) => makeApiCall('GET', ...args),
  post: (...args) => makeApiCall('POST', ...args)
};
