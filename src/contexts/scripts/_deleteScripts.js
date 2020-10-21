import * as api from '@/api/scripts';

export default function deleteScripts(scripts = []) {
  return new Promise((resolve, reject) => {
    if (!scripts.length) return;

    this.setState({ deletingScripts: true });

    const done = (e, rslts) => {
      this.setState(({ scripts: _scripts }) => ({
        deleteScriptsError: e,
        deletingScripts: false,
        ...e ? null : { scripts: _scripts.filter(s => scripts.map(s => s.scriptId).indexOf(s.id) < 0) },
      }));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteScripts({ scripts })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
