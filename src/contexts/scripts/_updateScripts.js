import * as api from '@/api/scripts';

export default ({ setState }) => function updateScripts(scripts = []) {
  if (!scripts.length) return;

  setState({ updatingScripts: true });

  const done = (updateScriptsError, data) => {
    setState({
      updateScriptsError,
      ...data,
      updatingScripts: false,
    });
  };

  api.updateScripts({ scripts })
    .then(data => done(data.errors, data))
    .catch(done);
};
