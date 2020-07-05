import * as api from '@/api/diagnoses';

export default ({ setState }) => function duplicateDiagnoses(ids = []) {
  if (!ids.length) return;

  setState({ duplicatingDiagnoses: true });

  const done = (e, rslts) => {
    setState(({ diagnoses }) => {
      return {
        duplicateDiagnosesError: e,
        duplicatingDiagnoses: false,
        ...e ? null : {
          diagnoses: diagnoses.reduce((acc, s) => [
            ...acc,
            s,
            ...ids.indexOf(s.id) < 0 ? [] : [rslts.diagnosis],
          ], []),
        },
      };
    });
  };

  api.duplicateDiagnosis({ id: ids[0] })
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};
