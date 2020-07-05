import * as api from '@/api/scripts';

export default ({ setState }) => function deleteScripts(ids = []) {
  if (!ids.length) return;

  setState({ deletingScripts: true });

  const done = (deleteScriptsError, data) => {
    setState({
      deleteScriptsError,
      ...data,
      deletingScripts: false,
    });
  };

  api.deleteScripts({ ids })
    .then(data => done(data.errors, data))
    .catch(done);
};
