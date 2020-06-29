import React from 'react';
import defaultState from './defaultState';

export const LayoutContext = React.createContext(null);

export const useLayoutContext = () => React.useContext(LayoutContext);

export const provideLayoutContext = Component => function LayoutContextProvider(props) {
  const [state, _setState] = React.useState({ ...defaultState });
  const setState = s => _setState(prev => typeof s === 'function' ? s(prev) : s);

  return (
    <LayoutContext.Provider
      value={{
        state,
        setState,
        _setState
      }}
    >
      <Component {...props} />
    </LayoutContext.Provider>
  );
};
