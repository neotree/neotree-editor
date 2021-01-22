import { Script, Screen, Diagnosis } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scripts: _scripts, deleteAssociatedData, } = req.body;

    const done = (err, rslts = []) => {
      res.locals.setResponse(err, { scripts: rslts });
      next();
    };

    let scripts = [];
    try {
      scripts = await Script.findAll({ where: { id: _scripts.map(s => s.id) } });
    } catch (e) { return done(e); }

    const rslts = {};
    const deletedAt = new Date();

    try {
      rslts.scripts = await Script.update({ deletedAt }, { where: { id: scripts.map(s => s.id) } });

      const activeScripts = await Script.findAll({ where: { deletedAt: null }, order: [['position', 'ASC']] });
      await Promise.all(activeScripts.map((s, i) => Script.update({ position: i + 1, }, { where: { id: s.id } })));

      const deletedScripts = await Script.findAll({ where: { deletedAt: { $not: null } }, order: [['position', 'ASC']] });
      await Promise.all(deletedScripts.map((s, i) => Script.update({ position: activeScripts.length + i + 1, }, { where: { id: s.id } })));
    } catch (e) { return done(e); }

    if (deleteAssociatedData !== false) {
      try {
        rslts.screens = await Screen.update({ deletedAt }, { where: { script_id: scripts.map(s => s.script_id) } });
      } catch (e) { /* Do nothing */ }

      try {
        rslts.diagnoses = await Diagnosis.update({ deletedAt }, { where: { script_id: scripts.map(s => s.script_id) } });
      } catch (e) { /* Do nothing */ }
    }

    done(null, rslts);
  })();
};
