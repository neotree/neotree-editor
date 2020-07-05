import React from 'react';
import useRouter from '@/utils/useRouter';
import _getScript from './_getScript';
import _saveScript from './_saveScript';

export const ScriptContext = React.createContext(null);

export const useScriptContext = () => React.useContext(ScriptContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useScriptContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const provideScriptContext = Component => function ScriptContextProvider(props) {
  const router = useRouter();
  const { scriptId, scriptSection } = router.match.params;

  const [state, _setState] = React.useState({
    scriptSection: scriptSection || 'screens',
    form: {},
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

  const getScript = _getScript({ setState });
  const saveScript = _saveScript({ setState, state, router });

  React.useEffect(() => {
    const scriptInitialised = scriptId !== 'new' ? true : false;
    setState({ scriptInitialised, script: null, form: {} });
    if (scriptId !== 'new') getScript({ id: scriptId, });
  }, [scriptId]);

  return (
    <ScriptContext.Provider
      value={{
        state,
        setState,
        _setState,
        getScript,
        setForm,
        saveScript,
        canSaveScript: () => state.form.title && !state.savingScript,
      }}
    >
      <Component {...props} />
    </ScriptContext.Provider>
  );
};
