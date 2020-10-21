import * as api from '@/api/diagnoses';

export default function deleteDiagnoses(diagnoses = []) {
  if (!diagnoses.length) return;

  this.setState({ deletingDiagnoses: true });

  const done = (e) => {
    this.setState(({ diagnoses: _diagnoses }) => ({
      deleteDiagnosesError: e,
      deletingDiagnoses: false,
      ...e ? null : { diagnoses: _diagnoses.map(d => d.diagnosisId).filter(s => diagnoses.indexOf(s.id) < 0) },
    }));
  };

  api.deleteDiagnoses({ diagnoses })
    .then(data => done(data.errors, data))
    .catch(done);
}
