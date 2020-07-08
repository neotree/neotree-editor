import React from 'react';
import { useScriptContext } from '@/contexts/script';
import useRouter from '@/utils/useRouter';
import _getDiagnosis from './_getDiagnosis';
import _saveDiagnosis from './_saveDiagnosis';
import defaultForm from './_defaultForm';

export const DiagnosisContext = React.createContext(null);

export const useDiagnosisContext = () => React.useContext(DiagnosisContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useDiagnosisContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const provideDiagnosisContext = Component => function DiagnosisContextProvider(props) {
  const { state: { script } } = useScriptContext();

  const router = useRouter();
  const { diagnosisId, diagnosisSection } = router.match.params;

  const [state, _setState] = React.useState({
    diagnosisSection: diagnosisSection || 'diagnoses',
    form: defaultForm,
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const setForm = s => _setState(prev => ({
    ...prev,
    form: {
      ...prev.form,
      ...typeof s === 'function' ? s(prev.form) : s
    },
  }));

  const getDiagnosis = _getDiagnosis({ setState });
  const saveDiagnosis = _saveDiagnosis({ setState, state, router });

  React.useEffect(() => {
    const diagnosisInitialised = diagnosisId !== 'new' ? true : false;
    setState({ diagnosisInitialised, diagnosis: null, form: defaultForm });
    if (diagnosisId !== 'new') getDiagnosis({ id: diagnosisId, });
  }, [diagnosisId]);

  return (
    <DiagnosisContext.Provider
      value={{
        state,
        setState,
        _setState,
        getDiagnosis,
        setForm,
        saveDiagnosis,
        canSaveDiagnosis: () => state.form.name && !state.savingDiagnosis,
        isFormReady: () => script && ((diagnosisId === 'new') || !!state.diagnosis),
      }}
    >
      <Component {...props} />
    </DiagnosisContext.Provider>
  );
};
