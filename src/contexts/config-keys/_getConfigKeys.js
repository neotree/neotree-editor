import * as api from '@/api/config-keys';

export default function getConfigKeys() {
  return new Promise((resolve, reject) => {
    this.setState({ loadingConfigKeys: true });

    const done = (e, data) => {
      this.setState({
        getConfigKeysError: e,
        ...data,
        configKeysInitialised: true,
        loadingConfigKeys: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.getConfigKeys()
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
