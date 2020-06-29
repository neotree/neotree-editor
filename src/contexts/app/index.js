import React from 'react';

export const AppContext = React.createContext(null);

export const useAppContext = () => React.useContext(AppContext);

export const provideAppContext = Component => function AppContextProvider(props) {
  const [state, _setState] = React.useState({});
  const setState = s => _setState(prev => typeof s === 'function' ? s(prev) : s);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        _setState
      }}
    >
      <Component {...props} />
    </AppContext.Provider>
  );
};
