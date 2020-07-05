import * as api from '@/api/config-keys';

export default ({ setState }) => function deleteConfigKeys(ids = []) {
  if (!ids.length) return;

  setState({ deletingConfigKeys: true });

  const done = (e) => {
    setState(({ configKeys }) => ({
      deleteConfigKeysError: e,
      deletingConfigKeys: false,
      ...e ? null : { configKeys: configKeys.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteConfigKey({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
};
