import * as api from '@/api/scripts';

export default function getScript(payload = {}) {
  this.setState({ loadingScript: true });

  const done = (e, rslts) => {
    this.setState(({ form }) => ({
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
}
