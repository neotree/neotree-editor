import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

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

  const [_state, _setState] = React.useState({
    ...defaults.defaultState,
    scriptSection: scriptSection || defaults.defaultState.scriptSection,
  });

  const contextValue = new (class ScriptContextValue {
    constructor() {
      this._setState = _setState;
      this.state = _state;
      this.router = router;
      this.defaults = defaults;
    }

    setState = s => _setState(prev => ({
      ...prev,
      ...typeof s === 'function' ? s(prev) : s
    }));
  
    setForm = s => _setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        ...typeof s === 'function' ? s(prev.form) : s
      },
    }));

    canSaveScript = () => this.state.form.title && !this.state.savingScript;

    isFormReady = () => (scriptId === 'new') || !!this.state.script;

    setFormAndSave = f => {
      this.setForm(f);
      this.setState({ shouldSaveForm: true });
    };
  
    getScript = require('./_getScript').default.bind(this);

    saveScript = require('./_saveScript').default.bind(this);
  })();  

  React.useEffect(() => {
    const scriptInitialised = scriptId !== 'new' ? true : false;
    contextValue.setState({ scriptInitialised, script: null, form: defaults.defaultState.form, });
    if (scriptId !== 'new') contextValue.getScript({ script_id: scriptId, });
  }, [scriptId]);

  const { shouldSaveForm } = contextValue.state;

  React.useEffect(() => {
    if (shouldSaveForm) {
      contextValue.saveScript({ redirectOnSuccess: false });
      contextValue.setState({ shouldSaveForm: false });
    }
  }, [shouldSaveForm]);

  return (
    <ScriptContext.Provider
      value={contextValue}
    >
      <Component {...props} />
    </ScriptContext.Provider>
  );
};
