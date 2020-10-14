import * as api from '@/api/screens';

export default function duplicateScreens(ids = []) {
  if (!ids.length) return;

  this.setState({ duplicatingScreens: true });

  const done = (e, rslts) => {
    this.setState(({ screens }) => {
      return {
        duplicateScreensError: e,
        duplicatingScreens: false,
        ...e ? null : {
          screens: screens.reduce((acc, s) => [
            ...acc,
            s,
            ...ids.indexOf(s.id) < 0 ? [] : [rslts.screen],
          ], []),
        },
      };
    });
  };

  api.duplicateScreen({ id: ids[0] })
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
}
