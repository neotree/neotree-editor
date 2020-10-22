import * as api from '@/api/scripts';

export default function getScripts() {
  return new Promise((resolve, reject) => {
    this.setState({ loadingScripts: true });

    const done = (e, data) => {
      this.setState({
        getScriptsError: e,
        ...data,
        scriptsInitialised: true,
        loadingScripts: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.getScripts()
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
