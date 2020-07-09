import * as api from '@/api/config-keys';

export default ({ setState }) => function updateConfigKeys(configKeys = []) {
  if (!configKeys.length) return;

  setState({ updatingConfigKeys: true });

  const done = (updateConfigKeysError, data) => {
    setState({
      updateConfigKeysError,
      ...data,
      updatingConfigKeys: false,
    });
  };

  api.updateConfigKeys({ configKeys })
    .then(data => done(data.errors, data))
    .catch(done);
};
