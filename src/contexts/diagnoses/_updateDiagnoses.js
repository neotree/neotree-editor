import * as api from '@/api/diagnoses';

export default function updateDiagnoses(diagnoses = []) {
  return new Promise((resolve, reject) => {
    if (!diagnoses.length) return;

    this.setState({ updatingDiagnoses: true });

    const done = (e, data) => {
      this.setState({
        updateDiagnosesError: e,
        updatingDiagnoses: false,
      });
      if (e) { reject(e); } else { resolve(data); }
    };

    api.updateDiagnoses({ diagnoses })
      .then(data => done(data.errors, data))
      .catch(done);
  });
}
