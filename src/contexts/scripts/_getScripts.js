import * as api from '@/api/scripts';

export default ({ setState }) => function getScripts() {
  setState({ loadingScripts: true });

  const done = (getScriptsError, data) => {
    setState({
      getScriptsError,
      ...data,
      scriptsInitialised: true,
      loadingScripts: false,
    });
  };

  api.getScripts()
    .then(data => done(data.errors, data))
    .catch(done);
};
