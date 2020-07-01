import React from 'react';
import _initialiseApp from './_initialiseApp';

export const AppContext = React.createContext(null);

export const useAppContext = () => React.useContext(AppContext);

export const provideAppContext = Component => function AppContextProvider(props) {
  const [state, _setState] = React.useState({});
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const initialiseApp = _initialiseApp({ setState });

  React.useEffect(() => { initialiseApp(); }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        _setState,
        initialiseApp
      }}
    >
      <Component {...props} />
    </AppContext.Provider>
  );
};
