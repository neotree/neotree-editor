import * as api from '@/api/config-keys';

export default ({ setState }) => function duplicateConfigKeys(ids = []) {
  if (!ids.length) return;

  setState({ duplicatingConfigKeys: true });

  const done = (e, rslts) => {
    setState(({ configKeys }) => {
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
};
