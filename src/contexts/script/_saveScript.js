import * as api from '@/api/scripts';
import getErrorMessage from '@/utils/getErrorMessage';

export default ({
  setState,
  router: { history, match: { params: { scriptId } } },
  state: { script, form, },
}) => function saveScript(payload = {}) {
  setState({ savingScript: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveScriptError: e,
      savingScript: false,
      form: { ...form, ...e ? {} : (rslts.script ? rslts.script.data : {}), },
    }));
  };

  const save = script ? api.updateScript : api.createScript;
  const data = JSON.stringify({ ...form, ...payload });

  save({ script_id: scriptId, type: form.type, ...script, data })
    .then(rslts => {
      if (rslts.script) history.push(`/scripts${script ? '' : `/${rslts.script.id}`}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
