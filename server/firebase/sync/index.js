import syncUsers from './syncUsers';

export default () => new Promise((resolve, reject) => {
  (async () => {
    const errors = [];

    try { await syncUsers(); } catch (e) { errors.push(e); }

    if (errors.length) reject(errors);

    resolve();
  })();
});
