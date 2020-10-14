import * as api from '@/api/scripts';

export default function deleteScripts(ids = []) {
  if (!ids.length) return;

  this.setState({ deletingScripts: true });

  const done = (e) => {
    this.setState(({ scripts }) => ({
      deleteScriptsError: e,
      deletingScripts: false,
      ...e ? null : { scripts: scripts.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteScript({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
}
