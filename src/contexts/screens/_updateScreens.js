import * as api from '@/api/screens';

export default ({ setState }) => function updateScreens(screens = []) {
  if (!screens.length) return;

  setState({ updatingScreens: true });

  const done = (updateScreensError, data) => {
    setState({
      updateScreensError,
      ...data,
      updatingScreens: false,
    });
  };

  api.updateScreens({ screens })
    .then(data => done(data.errors, data))
    .catch(done);
};
