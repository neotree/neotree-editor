import { uuid } from 'uuidv4';
import { User } from '../../database/models';

export default () => (req, res, next) => {
  const params = req.body;

  const done = (err, user) => {
    res.locals.setResponse(err, { user });
    next();
  };

  if (!params.email) return done({ msg: 'Required user "email" is not provided.' });

  (async () => {
    try {
        const rslts = await User.findOrCreate({
            where: { email: params.email },
            defaults: {
                user_id: uuid(),
                email: params.email,
                role: params.role,
                data: JSON.stringify({
                    activated: false,
                    countries:  params.countries || [], 
                    hospitals:  params.hospitals || [],
                }),
            },
        });

        const error = !rslts[0] ? new Error('Failed to add user') : null;

        done(error, rslts[0]);
    } catch (e) { done(e); }
  })();
};
