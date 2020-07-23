import * as api from '@/api/diagnoses';

export default function getDiagnoses(payload) {
  this.setState({ loadingDiagnoses: true });

  const done = (getDiagnosesError, data) => {
    this.setState({
      getDiagnosesError,
      ...data,
      diagnosesInitialised: true,
      loadingDiagnoses: false,
    });
  };

  api.getDiagnoses(payload)
    .then(data => done(data.errors, data))
    .catch(done);
}
