import * as api from '@/api/config-keys';

export default ({ setState }) => function getConfigKeys() {
  setState({ loadingConfigKeys: true });

  const done = (getConfigKeysError, data) => {
    setState({
      getConfigKeysError,
      ...data,
      configKeysInitialised: true,
      loadingConfigKeys: false,
    });
  };

  api.getConfigKeys()
    .then(data => done(data.errors, data))
    .catch(done);
};
