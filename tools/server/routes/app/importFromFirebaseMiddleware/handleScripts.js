import uuid from 'uuidv4';
import Actions from '../../../models/actions';

export default (app, { scripts, created_date, author }, done) => {
  scripts.forEach(({ screens, diagnoses, ...script }, scriptIndex) => {
    const isLastScript = scriptIndex === (scripts.length - 1);
    const script_id = uuid();

    Actions.add(app.pool, 'scripts', { id: script_id, created_date, author, data: JSON.stringify(script) }, err => {
      if (err) console.log(err);

      const insertDiagnoses = () => new Promise((resolve) => {
        diagnoses.forEach(({ createdAt, updatedAt, scriptId, diagnosisId, ...diagnosis }, i) => { // eslint-disable-line
          const isLast = i === (diagnoses.length - 1);
          const diagnosis_id = uuid();

          Actions.add(app.pool, 'diagnoses', {
            id: diagnosis_id,
            script_id,
            created_date,
            author,
            data: JSON.stringify(diagnosis)
          }, err => {
            if (err) console.log(err);
            if (isLast) resolve();
          });
        });
      });

      const insertScreens = () => new Promise((resolve) => {
        screens.forEach(({ createdAt, updatedAt, scriptId, screenId, ...screen }, i) => { // eslint-disable-line
          const isLast = i === (screens.length - 1);
          const screen_id = uuid();

          Actions.add(app.pool, 'screens', {
            id: screen_id,
            script_id,
            created_date,
            author,
            position: screen.position || null,
            type: screen.type || null,
            data: JSON.stringify(screen)
          }, err => {
            if (err) console.log(err);
            if (isLast) resolve();
          });
        });
      });

      Promise.all([insertScreens(), insertDiagnoses()])
        .then(() => { /**/ }).catch(err => console.log(err));

      if (isLastScript) done();
    });
  });
};
