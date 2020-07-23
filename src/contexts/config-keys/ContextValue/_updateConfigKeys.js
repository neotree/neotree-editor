import * as api from '@/api/config-keys';

export default function updateConfigKeys(configKeys = []) {
  if (!configKeys.length) return;

  this.setState({ updatingConfigKeys: true });

  const done = (updateConfigKeysError, data) => {
    this.setState({
      updateConfigKeysError,
      ...data,
      updatingConfigKeys: false,
    });
  };

  api.updateConfigKeys({ configKeys })
    .then(data => done(data.errors, data))
    .catch(done);
}
