import * as api from '@/api/screens';

export default function getScreens(payload) {
  return new Promise((resolve, reject) => {
    this.setState({ loadingScreens: true });

    const done = (e, data) => {
      this.setState({
        getScreensError: e,
        ...data,
        screensInitialised: true,
        loadingScreens: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.getScreens(payload)
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
