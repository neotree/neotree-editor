import uuid from 'uuidv4';
import insertData from './insert';
import parseScripts from './parseScripts';

export default (app, req, cb) => {
  const data = JSON.parse(req.file.buffer);
  const scripts = parseScripts(data);
  const insert = insertData(app, req);

  scripts.forEach(({ screens, diagnoses, ...script }, scriptIndex) => {
    const isLastScript = scriptIndex === (scripts.length - 1);
    const scriptId = uuid();
    insert('scripts', { id: scriptId, ...script }, err => {
      if (err) console.log(err);

      const insertDiagnoses = () => new Promise((resolve) => {
        diagnoses.forEach((diagnosis, i) => {
          diagnosis.symptoms = JSON.stringify(diagnosis.symptoms || {});
          const isLast = i === (diagnoses.length - 1);
          const diagnosisId = uuid();

          insert('diagnoses', { id: diagnosisId, script_id: scriptId, ...diagnosis }, err => {
            if (err) console.log(err);
            if (isLast) resolve();
          });
        });
      });

      const insertScreens = () => new Promise((resolve) => {
        screens.forEach((screen, i) => {
          screen.metadata = JSON.stringify(screen.metadata || {});
          const isLast = i === (screens.length - 1);
          const screenId = uuid();

          insert('screens', { id: screenId, script_id: scriptId, ...screen }, err => {
            if (err) console.log(err);
            if (isLast) resolve();
          });
        });
      });

      Promise.all([
        insertScreens(),
        insertDiagnoses()
      ]).then(() => cb(null, { status: 'OK' }))
        .catch(err => isLastScript && console.log(err));
    });
  });
};
