import * as api from '@/api/diagnoses';

export default function deleteDiagnoses(ids = []) {
  if (!ids.length) return;

  this.setState({ deletingDiagnoses: true });

  const done = (e) => {
    this.setState(({ diagnoses }) => ({
      deleteDiagnosesError: e,
      deletingDiagnoses: false,
      ...e ? null : { diagnoses: diagnoses.filter(s => ids.indexOf(s.id) < 0) },
    }));
  };

  api.deleteDiagnosis({ id: ids[0] })
    .then(data => done(data.errors, data))
    .catch(done);
}
