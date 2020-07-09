import http from 'http';
import uuidv4 from 'uuidv4';
import { ConfigKey, Script, Screen, Diagnosis } from '../../models';
import { findAndUpdateScreens } from '../../routes/screens/updateScreensMiddleware';
import splitCamelCase from '../../../utils/splitCamelCase';

const callRemote = (req, url) => {
  return new Promise((resolve, reject) => {
    const { source } = req.body;
    http.get(url, response => {
      let data = '';

      response.on('data', chunk => (data += chunk));

      response.on('end', () => {
        if (data) {
          try {
            data = JSON.parse(data);
            return data.error ? reject(data.error) : resolve(data);
          } catch (e) {
            reject(e);
          }
        }
        reject({ msg: `Something went wrong fetching the original ${source.dataType}.` });
      });
    }).on('error', reject);
  });
};

module.exports = () => (req, res, next) => {
  const { source, destination } = req.body;

  const copy = (source, destination) => new Promise(resolve => {
    const done = (error, data) => {
      resolve({ error, data });
      return null;
    };

    const getSourcePayload = JSON.stringify({ id: source.dataId });
    const getSourceURL = `${source.host}/get-full-${splitCamelCase(source.dataType, '-')}?payload=${getSourcePayload}`;

    callRemote(req, getSourceURL)
      .then(data => {
        if (data.error) return done(data.error);

        const dataToImport = data.payload[source.dataType];

        const author = req.user ? req.user.id : null;
        const id = uuidv4();

        const persitScriptItems = (Model, { data, ...params }) => {
          return new Promise((resolve, reject) => {
            const done = (err, item) => {
              if (err) { reject(err); } else { resolve(item); }
              return null;
            };

            Model.create({
              ...data,
              data: JSON.stringify(data.data || {}),
              id,
              author,
              ...params,
            }).then(s => done(null, s)).catch(done);

            return null;
          });
        };

        switch (source.dataType) {
          case 'configKey':
            return ConfigKey.create({
              ...dataToImport,
              data: JSON.stringify(dataToImport.data || {}),
              id,
              author
            }).then(s => done(null, s)).catch(done);
          case 'screen':
            return persitScriptItems(Screen, { data: { ...dataToImport, position: 1, script_id: destination.dataId } })
              .then(item => {
                findAndUpdateScreens(
                  {
                    attributes: ['id'],
                    where: { script_id: item.script_id },
                    order: [['position', 'ASC']]
                  },
                  screens => screens.map((scr, i) => ({ ...scr, position: i + 1 }))
                ).then(() => null).catch(() => null);
                return done(null, item);
              })
              .catch(done);
          case 'diagnosis':
            return persitScriptItems(Diagnosis, { data: { ...dataToImport, position: 1, script_id: destination.dataId } })
              .then(item => done(null, item))
              .catch(done);
          case 'script':
            return Script.create({
              ...dataToImport,
              data: JSON.stringify(dataToImport.data || {}),
              id,
              author
            }).then(s => {
              callRemote(req, `${source.host}/get-script-items?payload=${JSON.stringify({ script_id: source.dataId })}`)
                .then(({ payload }) => {
                  const promises = [
                    ...payload.screens.map((screen, position) =>
                      persitScriptItems(Screen, { position, id: uuidv4(), data: { ...screen, script_id: s.id } })),
                    ...payload.diagnoses.map((d, position) =>
                      persitScriptItems(Diagnosis, { position, id: uuidv4(), data: { ...d, script_id: s.id } }))
                  ];
                  Promise.all(promises).then(() => done(null, s))
                    .catch(() => done(null, s));
                })
                .catch(() => done(null, s));
            }).catch(done);
          default:
            done({ msg: 'Data could not be processed.' });
        }

        return done(null, { [source.dataType]: dataToImport });
      }).catch(done);
  });

  const { ids, ...s } = source;

  Promise.all(ids.map(dataId => copy({ ...s, dataId }, destination)))
    .then(rslts => {
      const payload = [];
      const errors = [];

      rslts.forEach(({ error, data }) => {
        if (error) {
          errors.push(error);
        } else {
          payload.push(data);
        }
      });

      res.locals.setResponse(errors.length ? errors : null, payload);
      next();
    });
};
