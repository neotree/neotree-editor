/* global fetch */
import queryString from 'query-string';

export default (url = '', opts = {}) => {
  const { body, method: m, ...reqOpts } = opts;
  reqOpts.headers = { ...reqOpts.headers };
  const method = (m || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?${queryString.stringify(body || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...body });
  }

  return new Promise((resolve, reject) => {
    fetch(url, { method, ...reqOpts })
      .then(res => {
        return res.json();
      })
      .then(res => resolve(res))
      .catch(e => {
        reject(e);
      });
  });
};
