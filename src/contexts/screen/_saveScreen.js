import * as api from '@/api/screens';
import getErrorMessage from '@/utils/getErrorMessage';

export default function saveScreen(_payload = {}) {
  const {
    setState,
    router: { history, match: { params: { scriptId } } },
    state: { screen, form, },
  } = this;

  const { redirectOnSuccess, ...payload } = _payload;
  const shdRedirect = redirectOnSuccess !== false;

  setState({ savingScreen: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveScreenError: e,
      savingScreen: false,
      form: { ...form, ...rslts.screen },
    }));
  };

  const save = screen ? api.updateScreen : api.createScreen;

  save({ ...screen, ...form, ...payload })
    .then(rslts => {
      if (shdRedirect && rslts.screen) history.push(`/scripts/${scriptId}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
}
