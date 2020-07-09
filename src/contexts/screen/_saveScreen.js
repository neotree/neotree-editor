import * as api from '@/api/screens';
import getErrorMessage from '@/utils/getErrorMessage';

export default ({
  setState,
  router: { history, match: { params: { scriptId } } },
  state: { screen, form, },
}) => function saveScreen(_payload = {}) {
  const { redirectOnSuccess, ...payload } = _payload;
  const shdRedirect = redirectOnSuccess !== false;

  setState({ savingScreen: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveScreenError: e,
      savingScreen: false,
      form: { ...form, ...e ? {} : (rslts.screen ? rslts.screen.data : {}), },
    }));
  };

  const save = screen ? api.updateScreen : api.createScreen;
  const data = JSON.stringify({ ...form, ...payload });

  save({ script_id: scriptId, type: form.type, ...screen, data })
    .then(rslts => {
      if (shdRedirect && rslts.screen) history.push(`/scripts/${scriptId}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
