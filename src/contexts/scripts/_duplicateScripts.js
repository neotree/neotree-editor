import * as api from '@/api/scripts';

export default function duplicateScripts(scripts = []) {
  return new Promise((resolve, reject) => {
    if (!scripts.length) return;

    this.setState({ duplicatingScripts: true });

    const done = (e, rslts) => {
      this.setState(({ scripts: _scripts }) => {
        return {
          duplicateScriptsError: e,
          duplicatingScripts: false,
          ...(e ? null : {
            scripts: [..._scripts, ...(rslts && rslts.scripts ? rslts.scripts : [])],
          }),
        };
      });
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.duplicateScripts({ scripts })
      .then(rslts => done(rslts.errors, rslts))
      .catch(done);
  });
}
