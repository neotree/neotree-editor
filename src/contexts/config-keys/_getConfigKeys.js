import * as api from '@/api/config-keys';

export default function getConfigKeys() {
  this.setState({ loadingConfigKeys: true });

  const done = (getConfigKeysError, data) => {
    this.setState({
      getConfigKeysError,
      ...data,
      configKeysInitialised: true,
      loadingConfigKeys: false,
    });
  };

  api.getConfigKeys()
    .then(data => done(data.errors, data))
    .catch(done);
}
