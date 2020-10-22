import * as api from '@/api/config-keys';

export default function updateConfigKeys(configKeys = []) {
  return new Promise((resolve, reject) => {
    if (!configKeys.length) return;

    this.setState({ updatingConfigKeys: true });

    const done = (e, data) => {
      this.setState({
        updateConfigKeysError: e,
        updatingConfigKeys: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.updateConfigKeys({ configKeys })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
