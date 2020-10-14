import * as api from '@/api/scripts';

export default function duplicateScripts(ids = []) {
  if (!ids.length) return;

  this.setState({ duplicatingScripts: true });

  const done = (e, rslts) => {
    this.setState(({ scripts }) => {
      return {
        duplicateScriptsError: e,
        duplicatingScripts: false,
        ...e ? null : {
          scripts: scripts.reduce((acc, s) => [
            ...acc,
            s,
            ...ids.indexOf(s.id) < 0 ? [] : [rslts.script],
          ], []),
        },
      };
    });
  };

  api.duplicateScript({ id: ids[0] })
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
}
