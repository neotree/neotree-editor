/* global fetch */
import queryString from 'query-string';

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  const { body, method: m, ...reqOpts } = opts;
  reqOpts.headers = { ...reqOpts.headers };
  const method = (m || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?${queryString.stringify(body || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...body });
  }

  fetch(url, { method, ...reqOpts })
    .then(res => res.json())
    .then(res => {
      const error = res.error || res.errors;
      if (error) return reject(error.map ? error : [error]);
      resolve(res);
    })
    .catch(reject);
});
