import { User } from '../../database';

module.exports = () => (req, res, next) => {
  const { role, user_id, hospitals, countries, } = req.body;

  const done = (err, user) => {
    res.locals.setResponse(err, { user });
    next();
  };

  if (!user_id) return done({ msg: 'Required user "id" is not provided.' });

  (async () => {
    try {
        const u = await User.findOne({ where: { user_id }, });
        if (u) {
            const { data } = JSON.parse(JSON.stringify(u));
            await User
                .update(
                    Object.assign({},
                        { 
                            data: JSON.stringify({ 
                                ...data, 
                                countries: countries || data.countries, 
                                hospitals: hospitals || data.hospitals, 
                            }),
                        },
                        role ? { role } : {},
                    ), 
                    { where: { user_id }, }
                );
            const user = await User.findOne({ where: { user_id }, });
            done(null, user);
        } else {
            done(new Error('User not found'));
        }
    } catch (e) { done(e); }
  })();
};
