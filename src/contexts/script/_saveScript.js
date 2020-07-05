import * as api from '@/api/scripts';

export default ({
  setState,
  router: { history },
  state: { script, form, },
}) => function saveScript(payload = {}) {
  setState({ savingScript: true });

  const done = (e, rslts) => {
    setState({
      saveScriptError: e,
      savingScript: false,
      ...rslts,
      form: e ? {} : (rslts.script ? rslts.script.data : {}),
    });
  };

  const save = script ? api.updateScript : api.createScript;
  const data = JSON.stringify({ ...form, ...payload });

  save({ ...script, data })
    .then(rslts => {
      if (!script && rslts.script) history.push(`/scripts/${rslts.script.id}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
