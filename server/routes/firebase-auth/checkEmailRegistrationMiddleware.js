import { User } from '../../database';
import { v4 } from 'uuidv4';

module.exports = () => (req, res, next) => {
  const { email } = req.query;

  const done = ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  (async () => {
    let user = null;
    try {
      user = await User.findOne({ where: { email } });
    } catch (e) { return done(e); }

    if (!user) return done('Email address not registered');

    done(null, {
      email,
      userId: user.uid,
      activated: user ? !!userDetails.password : false,
    });
  })();
};
