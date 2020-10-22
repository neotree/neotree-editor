import * as api from '@/api/diagnoses';

export default function duplicateDiagnoses(diagnoses = []) {
  return new Promise((resolve, reject) => {
    if (!diagnoses.length) return;

    this.setState({ duplicatingDiagnoses: true });

    const done = (e, rslts) => {
      this.setState(({ diagnoses: _diagnoses }) => {
        return {
          duplicateDiagnosesError: e,
          duplicatingDiagnoses: false,
          ...(e ? null : {
            diagnoses: [..._diagnoses, ...(rslts && rslts.diagnoses ? rslts.diagnoses : [])],
          }),
        };
      });
      if (e) { reject(e); } else { resolve(rslts); }
    };

    api.duplicateDiagnoses({ diagnoses })
      .then(rslts => done(rslts.errors, rslts))
      .catch(done);
  });
}
