import * as api from '@/api/screens';

export default function updateScreens(screens = []) {
  if (!screens.length) return;

  this.setState({ updatingScreens: true });

  const done = (updateScreensError, data) => {
    this.setState({
      updateScreensError,
      ...data,
      updatingScreens: false,
    });
  };

  api.updateScreens({ screens })
    .then(data => done(data.errors, data))
    .catch(done);
}
