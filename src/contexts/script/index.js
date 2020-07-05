import React from 'react';
import { useParams } from 'react-router-dom';
import _getScript from './_getScript';

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
  const { scriptId, scriptSection } = useParams();

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
      }}
    >
      <Component {...props} />
    </ScriptContext.Provider>
  );
};
