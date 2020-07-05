import * as api from '@/api/scripts';

export default ({ setState }) => function copyScripts(ids = []) {
  if (!ids.length) return;

  setState({ copyingScripts: true });

  const done = (copyScriptsError, data) => {
    setState({
      copyScriptsError,
      ...data,
      copyingScripts: false,
    });
  };

  api.copyScripts({ ids })
    .then(data => done(data.errors, data))
    .catch(done);
};
