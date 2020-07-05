import * as api from '@/api/screens';

export default ({ setState }) => function deleteScreens(ids = []) {
  if (!ids.length) return;

  setState({ deletingScreens: true });

  const done = (e) => {
    setState(({ screens }) => ({
      deleteScreensError: e,
      deletingScreens: false,
      ...e ? null : { screens: screens.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteScreen({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
};
