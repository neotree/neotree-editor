import 'isomorphic-fetch';

export default (url, data = {}, method = 'GET') => {
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
  return global.fetch(url, opts);
};
