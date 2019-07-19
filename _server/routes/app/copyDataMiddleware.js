import http from 'http';
import { ConfigKey, Script, Screen, Diagnosis } from '../../models';

const callRemote = (req, url) => {
  return new Promise((resolve, reject) => {
    const { source } = req.body;
    http.get(url, response => {
      let data = '';

      response.on('data', chunk => (data += chunk));

      response.on('end', () => {
        if (data) return resolve(JSON.parse(data));
        reject({ msg: `Something went wrong fetching the original ${source.dataType}.` });
      });
    }).on('error', reject);
  });
};

module.exports = () => (req, res, next) => {
  const { source, destination } = req.body;

  const done = (err, data = {}) => {
    res.locals.setResponse(err, { [source.dataType]: data });
    next(); return null;
  };

  const getSourcePayload = JSON.stringify({ id: source.dataId });
  const getSourceURL = `${source.host}/get-full-${source.dataType}?payload=${getSourcePayload}`;

  callRemote(req, getSourceURL)
    .then(data => {
      if (data.error) return done(data.error);

      const dataToImport = data.payload[source.dataType];

      const author = req.user ? req.user.id : null;
      const id = require('uuidv4')();

      const persitScriptItems = (Model, { data, isSingle, ...params }, cb) => {
        const done = (err, item) => {
          if (cb) cb(err, item);
          return null;
        };

        const persist = otherParams => Model.create({
          ...data,
          data: JSON.stringify(data.data || {}),
          details: JSON.stringify({
            ...data.details || {},
            originalHost: source.host,
            originalId: data.id
          }),
          id,
          author,
          ...params,
          ...otherParams
        }).then(s => done(null, s)).catch(done);

        if (isSingle === false) return persist();

        Model.count({ where: { script_id: destination.dataId } })
          .then(position => {
            persist({ position, script_id: destination.dataId });
            return null;
          })
          .catch(done);

        return null;
      };

      switch (source.dataType) {
        case 'configKey':
          return ConfigKey.create({
            ...dataToImport,
            data: JSON.stringify(dataToImport.data || {}),
            details: JSON.stringify({
              ...dataToImport.details || {},
              originalHost: source.host
            }),
            id,
            author
          }).then(s => done(null, s)).catch(done);
        case 'screen':
          return persitScriptItems(Screen, { data: dataToImport }, done);
        case 'diagnosis':
          return persitScriptItems(Diagnosis, { data: dataToImport }, done);
        case 'script':
          return Script.create({
            ...dataToImport,
            data: JSON.stringify(dataToImport.data || {}),
            details: JSON.stringify({
              ...dataToImport.details || {},
              originalHost: source.host
            }),
            id,
            author
          }).then(s => {
            callRemote(`${source.host}/get-script-items?payload=${JSON.stringify({ script_id: source.dataType })}`)
              .then(items => {
                items.screens.forEach((screen, position) =>
                  persitScriptItems(Screen, { data: { ...screen, script_id: s.id, position }, isSingle: false }));
                items.diagnoses.forEach((d, position) =>
                  persitScriptItems(Diagnosis, { data: { ...d, script_id: s.id, position }, isSingle: false }));
              })
              .catch(() => null);

            return done(null, s);
          }).catch(done);
        default:
          done({ msg: 'Data could not be processed.' });
      }

      return done(null, { [source.dataType]: dataToImport });
    }).catch(done);
};
