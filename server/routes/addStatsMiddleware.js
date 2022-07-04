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
    if (countlyServer) countlyServer.start();
}

export function testCounty(_, res) {
    countlyServer.add_bulk_request([
        { begin_session: 1, device_id: 'user@email.com', },
        { 
            metrics:{ _os: 'android', }, 
            device_id: 'device_id',
            events: JSON.stringify({
                key: 'Test1',
                count: 1,
            }),
        },
        { 
            metrics:{ _os: 'android', }, 
            device_id: 'device_id',
            events: JSON.stringify({
                key: 'Test2',
                count: 1,
            }),
        },
        { 
            metrics:{ _os: 'android', }, 
            device_id: 'device_id',
            events: JSON.stringify({
                key: 'Test3',
                count: 1,
            }),
        },
    ]);
    res.json({ status: 'ok', });
}

export default (req, res) => {
    (async () => {
        const appInfo = await database.App.findOne({ where: { id: 1 } });

        if (countlyServer && hasEnvVariables && appInfo && !appInfo.should_track_usage) return res.json({ success: true });

        const stats = req.body.stats || [];

        console.log(stats);

        // stats.forEach(stat => {
        //     countlyServer.add_request({ 
        //         begin_session: 1, 
        //         metrics:{ _os: req.body.device, }, 
        //         device_id: req.body.user, 
        //         events: [{
        //             key: stat.data.screenTitle || stat.data.screenId,
        //             count: stat.count,
        //             // dur: stat.duration,
        //             // timestamp: stat.timestamp || new Date().getTime(),
        //         }],
        //     });
        // });

        countlyServer.add_bulk_request([
            { begin_session: 1, device_id: req.body.user, },
            ...stats.map((stat, i) => ({ 
                metrics:{ _os: req.body.device, }, 
                device_id: req.body.user, 
                events: JSON.stringify({
                    key: stat.data.screenTitle || stat.data.screenId,
                    count: stat.count,
                    // dur: stat.duration,
                    // timestamp: stat.timestamp || new Date().getTime(),
                }),
            })),
        ]);

        res.json({ success: true });
    })();
};
