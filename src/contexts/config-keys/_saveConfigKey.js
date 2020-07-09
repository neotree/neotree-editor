import * as api from '@/api/config-keys';

export default ({
  setState,
}) => function saveConfigKey(configKey, form = {}, cb) {
  const done = (e, rslts) => {
    if (cb) cb(e, rslts);

    setState(({ configKeys }) => {
      let updatedConfigKeys = [...configKeys];
      if (rslts && rslts.configKey) {
        updatedConfigKeys = !configKey ?
          [...configKeys, rslts.configKey]
          :
          configKeys.map(key => key.id === rslts.configKey.id ? rslts.configKey : key);
      }
      return {
        configKeys: updatedConfigKeys,
      };
    });
  };

  const save = configKey ? api.updateConfigKey : api.createConfigKey;
  const data = JSON.stringify({ ...form });

  save({ ...configKey, data })
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};
