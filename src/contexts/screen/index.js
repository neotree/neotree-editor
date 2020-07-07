import React from 'react';
import useRouter from '@/utils/useRouter';
import _getScreen from './_getScreen';
import _saveScreen from './_saveScreen';
import defaultForm from './_defaultForm';

export const ScreenContext = React.createContext(null);

export const useScreenContext = () => React.useContext(ScreenContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useScreenContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const provideScreenContext = Component => function ScreenContextProvider(props) {
  const router = useRouter();
  const { scriptItemId: screenId, screenSection } = router.match.params;

  const [state, _setState] = React.useState({
    screenSection: screenSection || 'screens',
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

  const getScreen = _getScreen({ setState });
  const saveScreen = _saveScreen({ setState, state, router });

  React.useEffect(() => {
    const screenInitialised = screenId !== 'new' ? true : false;
    setState({ screenInitialised, screen: null, form: defaultForm });
    if (screenId !== 'new') getScreen({ id: screenId, });
  }, [screenId]);

  return (
    <ScreenContext.Provider
      value={{
        state,
        setState,
        _setState,
        getScreen,
        setForm,
        saveScreen,
        canSaveScreen: () => state.form.title && !state.savingScreen,
      }}
    >
      <Component {...props} />
    </ScreenContext.Provider>
  );
};
