import * as api from '@/api/screens';

export default function updateScreens(screens = []) {
  return new Promise((resolve, reject) => {
    if (!screens.length) return;

    this.setState({ updatingScreens: true });

    const done = (e, data) => {
      this.setState({
        updateScreensError: e,
        updatingScreens: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.updateScreens({ screens })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
