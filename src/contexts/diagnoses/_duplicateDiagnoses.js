import * as api from '@/api/diagnoses';

export default function duplicateDiagnoses(ids = []) {
  if (!ids.length) return;

  this.setState({ duplicatingDiagnoses: true });

  const done = (e, rslts) => {
    this.setState(({ diagnoses }) => {
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
}
