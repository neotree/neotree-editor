import Countly from 'countly-sdk-nodejs';

Countly.init({
    app_key: process.env.COUNTLY_APP_KEY,
    url: process.env.COUNTLY_HOST,
    debug: true
});

export default (req, res) => {
    const stats = req.body.stats || [];
    // Countly.begin_session();
    stats.forEach(stat => {
        Countly.add_event({
            key: stat.type,
            count: stat.count,
            // sum: 0,
            dur: stat.duration,
            segmentation: { ...stat.data }
        });
    });
    res.json({ success: true });
};
