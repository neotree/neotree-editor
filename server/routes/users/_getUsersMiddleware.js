import { User } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, users) => {
      res.locals.setResponse(err, { users });
      next();
    };

    let users = [];
    try {
      users = await User.findAll({ where: { deletedAt: null }, order: [['createdAt', 'ASC']], });
    } catch (e) { return done(e); }

    done(null, users);
  })();
};
