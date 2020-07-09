import * as api from '@/api/diagnoses';
import getErrorMessage from '@/utils/getErrorMessage';

export default ({
  setState,
  router: { history, match: { params: { scriptId } } },
  state: { diagnosis, form, },
}) => function saveDiagnosis(_payload = {}) {
  const { redirectOnSuccess, ...payload } = _payload;
  const shdRedirect = redirectOnSuccess !== false;

  setState({ savingDiagnosis: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveDiagnosisError: e,
      savingDiagnosis: false,
      form: { ...form, ...e ? {} : (rslts.diagnosis ? rslts.diagnosis.data : {}), },
    }));
  };

  const save = diagnosis ? api.updateDiagnosis : api.createDiagnosis;
  const data = JSON.stringify({ ...form, ...payload });

  save({ script_id: scriptId, ...diagnosis, data })
    .then(rslts => {
      if (shdRedirect && rslts.diagnosis) history.push(`/scripts/${scriptId}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
};
