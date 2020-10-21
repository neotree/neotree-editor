import * as api from '@/api/screens';

export default function duplicateScreens(screens = []) {
  return new Promise((resolve, reject) => {
    if (!screens.length) return;

    this.setState({ duplicatingScreens: true });

    const done = (e, rslts) => {
      this.setState(({ screens: _screens }) => {
        return {
          duplicateScreensError: e,
          duplicatingScreens: false,
          ...e ? null : {
            screens: [..._screens, ...(rslts && rslts.screens ? rslts.screens : [])],
          },
        };
      });
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.duplicateScreens({ screens })
      .then(rslts => done(rslts.errors, rslts))
      .catch(done);
  });
}
