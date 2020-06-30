/* global fetch */

export default (url = '', opts = {}) => {
  const reqOpts = {
    headers: { ...opts.headers },
  };

  const method = (opts.method || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?payload=${JSON.stringify(opts.payload || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...opts.payload });
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
