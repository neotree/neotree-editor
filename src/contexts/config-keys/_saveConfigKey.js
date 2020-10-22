import * as api from '@/api/config-keys';

export default function saveConfigKey(configKey, form = {}, cb) {
  return new Promise((resolve, reject) => {
    const done = (e, rslts) => {
      if (cb) cb(e, rslts);

      this.setState(({ configKeys }) => {
        let updatedConfigKeys = [...configKeys];
        if (rslts && rslts.configKey) {
          updatedConfigKeys = !configKey ?
            [...configKeys, rslts.configKey]
            :
            configKeys.map(ck => ck.configKeyId === rslts.configKey.configKeyId ? rslts.configKey : ck);
        }
        return {
          configKeys: updatedConfigKeys,
        };
      });

      if (e) { reject(e); } else { resolve(rslts); }
    };

    const save = configKey ? api.updateConfigKey : api.createConfigKey;

    save({ ...configKey, ...form })
      .then(rslts => done(rslts.errors, rslts))
      .catch(done);
  });
}
