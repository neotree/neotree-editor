import { v4 } from 'uuidv4';
import { Script, } from '../../database';

export async function createScript(payload = {}) {
  let scriptId = null;
  try {
    const snap = await firebase.database().ref('scripts').push();
    scriptId = snap.key;
  } catch (e) { throw e; }

  let scriptsCount = 0;
  try {
    scriptsCount = await Script.count({ where: {} });
  } catch (e) { /* Do nothing */ }

  let script = {
    ...payload,
    scriptId,
    script_id: scriptId,
    position: scriptsCount + 1,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  };

  try {
    const rslts = await Script.findOrCreate({
      where: { script_id: script.scriptId },
      defaults: {
        position: script.position,
        data: JSON.stringify(script),
      }
    });
    if (rslts && rslts[0]) {
      const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
      script = { ...data, ...s };
    }
  } catch (e) { throw e; }

  return script;
}

export function createScriptMiddleware() {
  return (req, res, next) => {
    (async () => {
      const done = (err, script) => {
        res.locals.setResponse(err, { script });
        next();
      };
      try {
        const script = await createScript(req.body);
        done(null, script);
      } catch (e) { return done(e); }
    })();
  };
}
