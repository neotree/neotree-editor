import * as api from '@/api/scripts';

export default function getScripts() {
  this.setState({ loadingScripts: true });

  const done = (getScriptsError, data) => {
    this.setState({
      getScriptsError,
      ...data,
      scriptsInitialised: true,
      loadingScripts: false,
    });
  };

  api.getScripts()
    .then(data => done(data.errors, data))
    .catch(done);
}
