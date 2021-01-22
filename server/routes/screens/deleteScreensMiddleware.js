import { Screen } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { screens: _screens, } = req.body;

    const done = (err, rslts = []) => {
      res.locals.setResponse(err, { screens: rslts });
      next();
    };

    let rslts = null;
    const deletedAt = new Date();

    let screens = [];
    try {
      screens = await Screen.findAll({ where: { id: _screens.map(s => s.id) } });
    } catch (e) { return done(e); }

    try {
      rslts = await Screen.update({ deletedAt }, { where: { id: _screens.map(s => s.id) } });
      const scriptIds = screens.map(s => s.script_id).reduce((acc, scriptId) => {
        if (acc.includes(scriptId)) return acc;
        return [...acc, scriptId];
      }, []);

      await Promise.all(scriptIds.map(script_id => new Promise(resolve => {
        (async () => {
          try {
            const activeScreens = await Screen.findAll({ where: { script_id, deletedAt: null }, order: [['position', 'ASC']] });
            await Promise.all(activeScreens.map((s, i) => Screen.update({ position: i + 1, }, { where: { id: s.id } })));

            const deletedScreens = await Screen.findAll({ where: { script_id, deletedAt: { $not: null } }, order: [['position', 'ASC']] });
            await Promise.all(deletedScreens.map((s, i) => Screen.update({ position: activeScreens.length + i + 1, }, { where: { id: s.id } })));
          } catch (e) { /* Do nothing */ }

          resolve();
        })();
      })));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
