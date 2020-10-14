import * as api from '@/api/screens';

export default function deleteScreens(ids = []) {
  if (!ids.length) return;

  this.setState({ deletingScreens: true });

  const done = (e) => {
    this.setState(({ screens }) => ({
      deleteScreensError: e,
      deletingScreens: false,
      ...e ? null : { screens: screens.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteScreen({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
}
