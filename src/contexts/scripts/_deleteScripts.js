import * as api from '@/api/scripts';

export default ({ setState }) => function deleteScripts(ids = []) {
  if (!ids.length) return;

  setState({ deletingScripts: true });

  const done = (e) => {
    setState(({ scripts }) => ({
      deleteScriptsError: e,
      deletingScripts: false,
      ...e ? null : { scripts: scripts.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteScript({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
};
