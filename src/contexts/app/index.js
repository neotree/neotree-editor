import React from 'react';
import * as defaults from './_defaults';

export const AppContext = React.createContext(null);

export const useAppContext = () => React.useContext(AppContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useAppContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const setNavSection = navSection => {
  const { setState } = useAppContext();
  React.useEffect(() => {
    setState({ navSection });
    return () => setState({ navSection: null });
  }, [navSection]);
};

export const provideAppContext = Component => function AppContextProvider(props) {
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class AppContextValue {
    state = state;

    _setState = _setState;

    setState = s => this._setState(prev => ({
      ...prev,
      ...(typeof s === 'function' ? s(prev) : s),
    }));
  })();

  return (
    <AppContext.Provider
      value={value}
    >
      <Component {...props} />
    </AppContext.Provider>
  );
};
