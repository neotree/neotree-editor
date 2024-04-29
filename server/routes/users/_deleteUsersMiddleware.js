import { User } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { users } = req.body;

    const done = (err, deletedUsers) => {
      res.locals.setResponse(err, { deletedUsers });
      next();
    };

    try { 
        await Promise.all(users.filter(u => u.user_id).map(u => User.destroy({
            where: { user_id: u.user_id, },
        }))); 
        done(null, users);
    } catch (e) { 
        done(e); 
    }
  })();
};
