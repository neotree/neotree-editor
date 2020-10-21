import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, scripts) => {
      res.locals.setResponse(err, { scripts });
      next();
    };

    let scripts = {};
    try {
      scripts = await new Promise((resolve) => {
        firebase.database()
          .ref('scripts')
          .on('value', snap => resolve(snap.val()));
      });
      scripts = scripts || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(scripts).map(key => scripts[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
