import * as api from '@/api/screens';

export default ({
  setState,
  router: { history },
  state: { screen, form, },
}) => function saveScreen(payload = {}) {
  setState({ savingScreen: true });

  const done = (e, rslts) => {
    setState({
      saveScreenError: e,
      savingScreen: false,
      ...rslts,
      form: e ? {} : (rslts.screen ? rslts.screen.data : {}),
    });
  };

  const save = screen ? api.updateScreen : api.createScreen;
  const data = JSON.stringify({ ...form, ...payload });

  save({ ...screen, data })
    .then(rslts => {
      if (!screen && rslts.screen) history.push(`/screens/${rslts.screen.id}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
