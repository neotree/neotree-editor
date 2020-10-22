import * as api from '@/api/diagnoses';
import getErrorMessage from '@/utils/getErrorMessage';

export default function saveDiagnosis(_payload = {}) {
  const {
    setState,
    router: { history, match: { params: { scriptId } } },
    state: { diagnosis, form, },
  } = this;

  const { redirectOnSuccess, ...payload } = _payload;
  const shdRedirect = redirectOnSuccess !== false;

  setState({ savingDiagnosis: true });

  const done = (e, rslts) => {
    if (e) alert(`Error(s):\n${getErrorMessage(e)}`) // eslint-disable-line
    setState(({ form }) => ({
      saveDiagnosisError: e,
      savingDiagnosis: false,
      form: { ...form, ...(rslts ? rslts.diagnosis : {}), },
    }));
  };

  const save = diagnosis ? api.updateDiagnosis : api.createDiagnosis;

  save({ scriptId, ...diagnosis, ...form, ...payload })
    .then(rslts => {
      if (shdRedirect && rslts.diagnosis) history.push(`/scripts/${scriptId}`);
      done(rslts.errors, rslts);
    })
    .catch(done);
}
