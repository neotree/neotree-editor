import * as api from '@/api/diagnoses';

export default ({
  setState,
  router: { history },
  state: { diagnosis, form, },
}) => function saveDiagnosis(payload = {}) {
  setState({ savingDiagnosis: true });

  const done = (e, rslts) => {
    setState({
      saveDiagnosisError: e,
      savingDiagnosis: false,
      ...rslts,
      form: e ? {} : (rslts.diagnosis ? rslts.diagnosis.data : {}),
    });
  };

  const save = diagnosis ? api.updateDiagnosis : api.createDiagnosis;
  const data = JSON.stringify({ ...form, ...payload });

  save({ ...diagnosis, data })
    .then(rslts => {
      if (!diagnosis && rslts.diagnosis) history.push(`/diagnoses/${rslts.diagnosis.id}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
