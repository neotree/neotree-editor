import React from 'react';
import { useScriptContext } from '@/contexts/script';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const ScreenContext = React.createContext(null);

export const useScreenContext = () => React.useContext(ScreenContext);

export const provideScreenContext = Component => function ScreenContextProvider(props) {
  const { state: { script } } = useScriptContext();

  const router = useRouter();
  const { screenId, screenSection, scriptId, } = router.match.params;

  const [state, _setState] = React.useState({
    ...defaults.defaultState,
    screenSection: screenSection || 'diagnoses',
  });

  const value = new (class ScreenContextValue {
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

    canSaveScreen = () => this.state.form.title && !this.state.savingScreen;

    isFormReady = () => script && ((screenId === 'new') || !!this.state.screen);

    setFormAndSave = f => {
      this.setForm(f);
      this.setState({ shouldSaveForm: true });
    };

    getScreen = require('./_getScreen').default.bind(this);

    saveScreen = require('./_saveScreen').default.bind(this);
  })();

  React.useEffect(() => {
    const screenInitialised = screenId !== 'new' ? true : false;
    value.setState({ screenInitialised, screen: null, form: defaults.defaultState.form });
    if (screenId !== 'new') value.getScreen({ screenId, scriptId });
  }, [screenId, scriptId]);

  const { shouldSaveForm } = state;

  React.useEffect(() => {
    if (shouldSaveForm) {
      value.saveScreen({ redirectOnSuccess: false });
      value.setState({ shouldSaveForm: false });
    }
  }, [shouldSaveForm]);

  return (
    <ScreenContext.Provider
      value={value}
    >
      <Component {...props} />
    </ScreenContext.Provider>
  );
};
