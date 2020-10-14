import * as api from '@/api/screens';

export default function getScreens(payload) {
  this.setState({ loadingScreens: true });

  const done = (getScreensError, data) => {
    this.setState({
      getScreensError,
      ...data,
      screensInitialised: true,
      loadingScreens: false,
    });
  };

  api.getScreens(payload)
    .then(data => done(data.errors, data))
    .catch(done);
}
