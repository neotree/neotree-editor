import * as api from '@/api/screens';

export default function deleteScreens(screens = []) {
  return new Promise((resolve, reject) => {
    if (!screens.length) return;

    this.setState({ deletingScreens: true });

    const done = (e, rslts) => {
      this.setState(({ screens: _screens }) => ({
        deleteScreensError: e,
        deletingScreens: false,
        ...e ? null : { screens: _screens.filter(s => screens.map(s => s.screenId).indexOf(s.screenId) < 0) },
      }));
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.deleteScreens({ screens })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
