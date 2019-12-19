/* global fetch, window */
import 'isomorphic-fetch';

const makeApiCall = (method = 'GET', url, data = {}) => {
  let opts = { method, credentials: 'same-origin' };
  if (!method || (method === 'GET') || (method === 'get')) {
    opts = { ...opts };
    url = `${url}?payload=${JSON.stringify(data)}`;
  } else {
    opts = {
      ...opts,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  return new Promise((resolve, reject) => {
    fetch(url, opts)
      .then(r => {
        try {
          if (!r.ok) return { error: { msg: `HTTP ERROR (${r.status}): ${r.statusText}` } };
          if (r.redirected) return (window.location = r.url);
          return r.json();
        } catch (e) {
          throw e;
        }
      })
      .then(r => {
        if (!r || r.error) return reject(r.error || { msg: 'Ooops, failed to copy, try again!' });
        resolve(r);
      })
      .catch(reject);
  });
};

export default {
  get: (...args) => makeApiCall('GET', ...args),
  post: (...args) => makeApiCall('POST', ...args),
};
