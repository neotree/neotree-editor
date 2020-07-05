import * as api from '@/api/scripts';

export default ({ setState }) => function duplicateScripts(ids = []) {
  if (!ids.length) return;

  setState({ duplicatingScripts: true });

  const done = (e, rslts) => {
    setState(({ scripts }) => {
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
};
