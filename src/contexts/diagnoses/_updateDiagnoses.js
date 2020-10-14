import * as api from '@/api/diagnoses';

export default function updateDiagnoses(diagnoses = []) {
  if (!diagnoses.length) return;

  this.setState({ updatingDiagnoses: true });

  const done = (updateDiagnosesError, data) => {
    this.setState({
      updateDiagnosesError,
      ...data,
      updatingDiagnoses: false,
    });
  };

  api.updateDiagnoses({ diagnoses })
    .then(data => done(data.errors, data))
    .catch(done);
}
