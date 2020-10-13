import * as api from '@/api/config-keys';

export default function duplicateConfigKeys(ids = []) {
  if (!ids.length) return;

  this.setState({ duplicatingConfigKeys: true });

  const done = (e, rslts) => {
    this.setState(({ configKeys }) => {
      return {
        duplicateConfigKeysError: e,
        duplicatingConfigKeys: false,
        ...e ? null : {
          configKeys: configKeys.reduce((acc, s) => [
            ...acc,
            s,
            ...ids.indexOf(s.id) < 0 ? [] : [rslts.configKey],
          ], []),
        },
      };
    });
  };

  api.duplicateConfigKey({ id: ids[0] })
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
}
