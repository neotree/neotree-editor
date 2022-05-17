import Countly from 'countly-sdk-nodejs';
import * as database from '../database';

const hasEnvVariables = process.env.COUNTLY_APP_KEY && process.env.COUNTLY_HOST;

if (hasEnvVariables) {
    Countly.init({
        app_key: process.env.COUNTLY_APP_KEY,
        url: process.env.COUNTLY_HOST,
        debug: true
    });
}

export default (req, res) => {
    (async () => {
        const appInfo = await database.App.findOne({ where: { id: 1 } });

        if (hasEnvVariables && appInfo && !appInfo.should_track_usage) return res.json({ success: true });

        const stats = req.body.stats || [];
        // Countly.begin_session();
        stats.forEach(stat => {
            Countly.track_view(stat.data.screenTitle || stat.data.screenId);
            // Countly.add_event({
            //     key: stat.type,
            //     count: stat.count,
            //     // sum: 0,
            //     dur: stat.duration,
            //     segmentation: { ...stat.data }
            // });
        });
        // Countly.end_session();
        res.json({ success: true });
    })();
};
