import { Script } from '../../database/models';

export const updateScript = ({ id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required script "id" is not provided.'));

    let script = null;
    try {
      script = await Script.findOne({ where: { id } });
    } catch (e) { return reject(e); }

    if (!script) return reject(new Error(`Script with id "${id}" not found`));

    try {
      await Script.update(
        {
          position: payload.position || script.position,
          data: JSON.stringify({ ...script.data, ...payload }),
        },
        { where: { id, deletedAt: null } }
      );
    } catch (e) { /* Do nothing */ }

    resolve(script);
  })();
});

export default () => (req, res, next) => {
  (async () => {
    const done = (err, script) => {
      res.locals.setResponse(err, { script });
      next();
    };

    let script = null;
    try { script = await updateScript(req.body); } catch (e) { return done(e); }

    done(null, script);
  })();
};
