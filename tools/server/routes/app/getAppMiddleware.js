import { initialiseAppData } from '../../models/App';
import Actions from '../../models/actions';

const getApp = (pool, cb) => Actions.get(pool, 'app', {}, cb);

module.exports = app => (req, res, next) => {
  getApp(app.pool, (err, rslts) => {
    if (err) {
      res.locals.setResponse(err);
      return next();
    }
    const _app = rslts.rows[0];

    if (_app) {
      res.locals.setResponse(null, { app: _app });
      return next();
    }

    initialiseAppData(app.pool, err => {
      console.log(err);
      if (err) {
        res.locals.setResponse(err);
        return next();
      }

      getApp(app.pool, (err, rslts = { rows: [{}] }) => {
        console.log(err);
        res.locals.setResponse(err, { app: rslts.rows[0] });
        next();
      });
    });
  });
};
