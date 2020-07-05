import * as api from '@/api/diagnoses';

export default ({ setState }) => function getDiagnoses(payload) {
  setState({ loadingDiagnoses: true });

  const done = (getDiagnosesError, data) => {
    setState({
      getDiagnosesError,
      ...data,
      diagnosesInitialised: true,
      loadingDiagnoses: false,
    });
  };

  api.getDiagnoses(payload)
    .then(data => done(data.errors, data))
    .catch(done);
};
