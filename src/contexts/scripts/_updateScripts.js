import * as api from '@/api/scripts';

export default function updateScripts(scripts = []) {
  if (!scripts.length) return;

  this.setState({ updatingScripts: true });

  const done = (updateScriptsError, data) => {
    this.setState({
      updateScriptsError,
      ...data,
      updatingScripts: false,
    });
  };

  api.updateScripts({ scripts })
    .then(data => done(data.errors, data))
    .catch(done);
}
