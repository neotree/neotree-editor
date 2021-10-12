import apiKeyAuthenticator from './apiKeyAuthenticator';
import { Configuration, } from '../../database';

export default (app, router) => {
    router.get(
        '/get-configuration',
        apiKeyAuthenticator(app),
        (req, res, next) => {
            (async () => {
                const { key } = req.query;
            
                const done = (err, configuration) => {
                res.locals.setResponse(err, { configuration });
                next();
                };
            
                let configuration = null;
                try {
                configuration = await Configuration.findOne({ where: { unique_key: key } });
                if (configuration) {
                    const { data, ...s } = JSON.parse(JSON.stringify(configuration));
                    configuration = { ...data, ...s };
                }
                } catch (e) { return done(e); }
            
                done(null, configuration);
            })();
        },
        require('../../utils/responseMiddleware')
    );

    router.post(
        '/add-configuration',
        apiKeyAuthenticator(app),
        (req, res, next) => {
            (async () => {
                const payload = req.body;
            
                const done = (err, configuration) => {
                res.locals.setResponse(err, { configuration });
                next();
                };
                let configuration = null;
                try {
                const rslts = await Configuration.create(payload);
                if (rslts && rslts[0]) {
                    const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
                    configuration = { ...data, ...s };
                }
                } catch (e) { return done(e); }
            
                done(null, configuration);
            })();
        },
        require('../../utils/responseMiddleware')
    );

    router.post(
        '/update-configuration',
        apiKeyAuthenticator(app),
        (req, res, next) => {
            const { key, ...payload } = req.body;

            const done = (err, configuration) => {
                res.locals.setResponse(err, { configuration });
                next();
            };

            (async () => {
                if (!key) return done(new Error('Required configuration "key" is not provided.'));
            
                let configuration = null;
                try {
                    configuration = await Configuration.findOne({ where: { unique_key: key } });
                } catch (e) { return done(e); }
            
                if (!configuration) return reject(new Error(`Configuration with unique_key "${key}" not found`));
            
                try {
                    await Configuration.update(
                        {
                            data: JSON.stringify({ ...configuration.data, ...payload }),
                        },
                        { where: { unique_key: key, deletedAt: null } }
                    );
                } catch (e) { return done(e); }
            
                done(null, configuration);
            })();
        },
        require('../../utils/responseMiddleware')
    );

    return router;
}
