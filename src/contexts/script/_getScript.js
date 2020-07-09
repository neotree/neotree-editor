import * as api from '@/api/scripts';

export default ({ setState }) => function getScript(payload = {}) {
  setState({ loadingScript: true });

  const done = (e, rslts) => {
    setState(({ form }) => ({
      initialiseScriptError: e,
      scriptInitialised: true,
      loadingScript: false,
      ...rslts,
      form: { ...form, ...e ? {} : (rslts.script ? rslts.script.data : {}), },
    }));
  };

  api.getScript(payload)
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};