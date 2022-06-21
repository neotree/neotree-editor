// import Countly from 'countly-sdk-nodejs';
import * as database from '../database';

var Countly = require("countly-sdk-nodejs").Bulk;

const hasEnvVariables = process.env.COUNTLY_APP_KEY && process.env.COUNTLY_HOST;

let countlyServer = null;
if (hasEnvVariables) {
    countlyServer = new Countly({
        app_key: process.env.COUNTLY_APP_KEY,
        url: process.env.COUNTLY_HOST,
        debug: true
    });
}

countlyServer.start();

export default (req, res) => {
    (async () => {
        const appInfo = await database.App.findOne({ where: { id: 1 } });

        if (countlyServer && hasEnvVariables && appInfo && !appInfo.should_track_usage) return res.json({ success: true });

        const stats = req.body.stats || [];

        console.log(stats);

        stats.forEach(stat => {
            countlyServer.add_request({ 
                begin_session: 1, 
                metrics:{ _os: req.body.device, }, 
                device_id: req.body.user, 
                events: [{
                    key: stat.data.screenTitle || stat.data.screenId,
                    dur: stat.duration,
                    count: stat.count,
                    timestamp: stat.timestamp || new Date().getTime(),
                }],
            });
        });

        // countlyServer.add_request({ 
        //     begin_session: 1, 
        //     metrics:{ _os: req.body.device, }, 
        //     device_id: req.body.user, 
        //     events: stats.map(stat => ({
        //         key: stat.data.screenTitle || stat.data.screenId,
        //         dur: stat.duration,
        //         count: stat.count,
        //         timestamp: stat.timestamp || new Date().getTime(),
        //     })),
        // });

        res.json({ success: true });
    })();
};
