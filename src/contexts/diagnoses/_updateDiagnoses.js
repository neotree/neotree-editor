import * as api from '@/api/diagnoses';

export default ({ setState }) => function updateDiagnoses(diagnoses = []) {
  if (!diagnoses.length) return;

  setState({ updatingDiagnoses: true });

  const done = (updateDiagnosesError, data) => {
    setState({
      updateDiagnosesError,
      ...data,
      updatingDiagnoses: false,
    });
  };

  api.updateDiagnoses({ diagnoses })
    .then(data => done(data.errors, data))
    .catch(done);
};
