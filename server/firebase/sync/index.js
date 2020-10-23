import syncUsers from './syncUsers';
import syncData from './syncData';

export default () => new Promise((resolve, reject) => {
  (async () => {
    const errors = [];

    try { await syncUsers(); } catch (e) { errors.push(e); }

    try { await syncData(); } catch (e) { errors.push(e); }

    if (errors.length) reject(errors);

    resolve();
  })();
});
