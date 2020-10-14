import * as api from '@/api/screens';

export default function getScreen(payload = {}) {
  this.setState({ loadingScreen: true });

  const done = (e, rslts) => {
    this.setState(({ form }) => ({
      initialiseScreenError: e,
      screenInitialised: true,
      loadingScreen: false,
      ...rslts,
      form: { ...form, ...e ? {} : (rslts.screen ? rslts.screen.data : {}), },
    }));
  };

  api.getScreen(payload)
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};
