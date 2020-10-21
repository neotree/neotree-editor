import * as api from '@/api/scripts';
import getErrorMessage from '@/utils/getErrorMessage';

export default function saveScript(_payload = {}) {
  const {
    setState,
    router: { history, match: { params: { scriptId } } },
    state: { script, form, },
  } = this;
  const { redirectOnSuccess, ...payload } = _payload;
  const shdRedirect = redirectOnSuccess !== false;

  setState({ savingScript: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveScriptError: e,
      savingScript: false,
      form: { ...form, ...rslts.script },
    }));
  };

  const save = script ? api.updateScript : api.createScript;

  save({ type: form.type, ...script, ...form, ...payload })
    .then(rslts => {
      if (shdRedirect && rslts.script) history.push(`/scripts${script ? '' : `/${rslts.script.id}`}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
}
