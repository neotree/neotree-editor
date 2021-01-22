/* global fetch */
function makeApiCall(method, endpoint, options = {}) {
  const { errorCodesMap, ...opts } = options;

  if (opts.body) opts.body = JSON.stringify({ ...opts.body });

  const getError = e => {
    let err = e.message || e.msg || e;
    if (errorCodesMap) err = errorCodesMap[err] || err;
    return err;
  };

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        await fetch(endpoint, {
          method,
          ...opts,
          headers: { 'Content-Type': 'application/json', ...opts.header, },
        })
          .then(res => res.json())
          .then(res => {
            const { errors, ...data } = res;
            if (errors && errors.length) {
              return reject(new Error(errors.map(e => getError(e)).join('\n')));
            }
            resolve(data);
          })
          .catch(reject);
      } catch (e) { reject(getError(e)); }
    })();
  });
}

export default {
  get: (...args) => makeApiCall('GET', ...args),
  post: (...args) => makeApiCall('POST', ...args),
};
