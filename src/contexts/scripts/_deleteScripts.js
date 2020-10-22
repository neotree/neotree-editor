import * as api from '@/api/scripts';

export default function deleteScripts(scripts = []) {
  return new Promise((resolve, reject) => {
    const { scripts: _scripts } = this.state;

    if (!scripts.length) return;

    this.setState({ deletingScripts: true });

    const done = (e, rslts) => {
      const updatedScripts = _scripts.filter(s => scripts.map(s => s.scriptId).indexOf(s.scriptId) < 0)
        .map((s, i) => ({ ...s, position: i + 1, }));
      this.setState({
        deleteScriptsError: e,
        deletingScripts: false,
        ...(e ? null : { scripts: updatedScripts }),
      });
      this.updateScripts(updatedScripts.map(s => ({ scriptId: s.scriptId, position: s.position, })));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteScripts({ scripts })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
