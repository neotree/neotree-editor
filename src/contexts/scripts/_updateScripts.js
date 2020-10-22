import * as api from '@/api/scripts';

export default function updateScripts(scripts = []) {
  return new Promise((resolve, reject) => {
    if (!scripts.length) return;

    this.setState({ updatingScripts: true });

    const done = (e, data) => {
      this.setState({
        updateScriptsError: e,
        updatingScripts: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.updateScripts({ scripts })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
