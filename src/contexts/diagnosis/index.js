import React from 'react';
import { useScriptContext } from '@/contexts/script';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const DiagnosisContext = React.createContext(null);

export const useDiagnosisContext = () => React.useContext(DiagnosisContext);

export const provideDiagnosisContext = Component => function DiagnosisContextProvider(props) {
  const { state: { script } } = useScriptContext();

  const router = useRouter();
  const { diagnosisId, diagnosisSection, scriptId, } = router.match.params;

  const [state, _setState] = React.useState({
    ...defaults.defaultState,
    diagnosisSection: diagnosisSection || 'diagnoses',
  });

  const value = new (class DiagnosisContextValue {
    state = state;

    _setState = _setState;

    router = router;

    defaults = defaults;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    setForm = s => _setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        ...typeof s === 'function' ? s(prev.form) : s
      },
    }));

    canSaveDiagnosis = () => this.state.form.name && !this.state.savingDiagnosis;

    isFormReady = () => script && ((diagnosisId === 'new') || !!this.state.diagnosis);

    setFormAndSave = f => {
      this.setForm(f);
      this.setState({ shouldSaveForm: true });
    };

    getDiagnosis = require('./_getDiagnosis').default.bind(this);

    saveDiagnosis = require('./_saveDiagnosis').default.bind(this);
  })();

  React.useEffect(() => {
    const diagnosisInitialised = diagnosisId !== 'new' ? true : false;
    value.setState({ diagnosisInitialised, diagnosis: null, form: defaults.defaultState.form });
    if (diagnosisId !== 'new') value.getDiagnosis({ scriptId, diagnosisId, });
  }, [diagnosisId, scriptId]);

  const { shouldSaveForm } = state;

  React.useEffect(() => {
    if (shouldSaveForm) {
      value.saveDiagnosis({ redirectOnSuccess: false });
      value.setState({ shouldSaveForm: false });
    }
  }, [shouldSaveForm]);

  return (
    <DiagnosisContext.Provider
      value={value}
    >
      <Component {...props} />
    </DiagnosisContext.Provider>
  );
};
