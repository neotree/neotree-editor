import * as api from '@/api/diagnoses';

export default ({ setState }) => function getDiagnosis(payload = {}) {
  setState({ loadingDiagnosis: true });

  const done = (e, rslts) => {
    setState({
      initialiseDiagnosisError: e,
      diagnosisInitialised: true,
      loadingDiagnosis: false,
      ...rslts,
      form: e ? {} : (rslts.diagnosis ? rslts.diagnosis.data : {}),
    });
  };

  api.getDiagnosis(payload)
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};
