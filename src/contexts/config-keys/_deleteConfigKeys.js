import * as api from '@/api/config-keys';

export default function deleteConfigKeys(configKeys = []) {
  return new Promise((resolve, reject) => {
    const { configKeys: _configKeys } = this.state;

    if (!configKeys.length) return;

    this.setState({ deletingConfigKeys: true });

    const done = (e, rslts) => {
      const updatedConfigKeys = _configKeys.filter(s => configKeys.map(s => s.configKeyId).indexOf(s.configKeyId) < 0)
        .map((s, i) => ({ ...s, position: i + 1, }));
      this.setState({
        deleteConfigKeysError: e,
        deletingConfigKeys: false,
        ...(e ? null : { configKeys: updatedConfigKeys }),
      });
      this.updateConfigKeys(updatedConfigKeys.map(s => ({ configKeyId: s.configKeyId, position: s.position, })));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteConfigKeys({ configKeys })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
