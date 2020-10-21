import { ApiKey } from '../../database';

module.exports = () => (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const api_endpoint = `${host}/api`;

  const done = (e, apiKey) => {
    res.locals.setResponse(e);
    if (e || !apiKey) return res.json({ error: e || { msg: 'Failed to get the api key' } });

    // const json = JSON.stringify(JSON.stringify({
    //   api_endpoint,
    //   api_key: apiKey.key
    // }, null, 4));

    const filename = 'neotree-webeditor-api.json';
    const mimetype = 'application/json';

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', mimetype);
    res.json({
      host,
      api_endpoint,
      api_key: apiKey.key
    });
  };

  ApiKey.findOne({ where: {} })
    .then(apiKey => done(null, apiKey))
    .catch(done);
};
