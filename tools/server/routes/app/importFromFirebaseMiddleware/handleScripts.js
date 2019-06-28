import uuid from 'uuidv4';
import { Script, Screen, Diagnosis } from '../../../models';

export default (app, { scripts, author }, done) => {
  scripts.forEach(({ screens, diagnoses, ...script }, scriptIndex) => {
    const isLastScript = scriptIndex === (scripts.length - 1);
    const script_id = uuid();

    Script.create({ id: script_id, author, data: JSON.stringify(script) })
      .then(() => {
        const insertDiagnoses = () => new Promise((resolve) => {
          diagnoses.forEach(({ createdAt, updatedAt, scriptId, diagnosisId, ...diagnosis }, i) => { // eslint-disable-line
            const isLast = i === (diagnoses.length - 1);
            const diagnosis_id = uuid();

            Diagnosis.create({
              id: diagnosis_id,
              script_id,
              author,
              data: JSON.stringify(diagnosis)
            }).then(() => isLast && resolve())
              .catch(err => console.log(err));
          });
        });

        const insertScreens = () => new Promise((resolve) => {
          screens.forEach(({ createdAt, updatedAt, scriptId, screenId, position, type, ...screen }, i) => { // eslint-disable-line
            const isLast = i === (screens.length - 1);
            const screen_id = uuid();

            Screen.create({
              id: screen_id,
              script_id,
              author,
              position,
              type,
              data: JSON.stringify(screen)
            }).then(() => isLast && resolve())
              .catch(err => console.log(err));
          });
        });

        Promise.all([insertScreens(), insertDiagnoses()])
          .then(() => { /**/ }).catch(err => console.log(err));

        if (isLastScript) done();
      })
      .catch(err => console.log(err));
  });
};
