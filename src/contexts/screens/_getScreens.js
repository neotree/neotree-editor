import * as api from '@/api/screens';

export default ({ setState }) => function getScreens(payload) {
  setState({ loadingScreens: true });

  const done = (getScreensError, data) => {
    setState({
      getScreensError,
      ...data,
      screensInitialised: true,
      loadingScreens: false,
    });
  };

  api.getScreens(payload)
    .then(data => done(data.errors, data))
    .catch(done);
};
