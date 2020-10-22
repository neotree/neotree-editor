import * as api from '@/api/config-keys';

export default function duplicateConfigKeys(configKeys = []) {
  return new Promise((resolve, reject) => {
    if (!configKeys.length) return;

    this.setState({ duplicatingConfigKeys: true });

    const done = (e, rslts) => {
      this.setState(({ configKeys: _configKeys }) => {
        return {
          duplicateConfigKeysError: e,
          duplicatingConfigKeys: false,
          ...(e ? null : {
            configKeys: [..._configKeys, ...(rslts && rslts.configKeys ? rslts.configKeys : [])],
          }),
        };
      });
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.duplicateConfigKeys({ configKeys })
      .then(rslts => done(rslts.errors, rslts))
      .catch(done);
  });
}
