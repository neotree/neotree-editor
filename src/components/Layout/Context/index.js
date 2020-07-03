/* global window */
import React from 'react';
import defaultState, { getViewPort } from './defaultState';

export const LayoutContext = React.createContext(null);

export const useLayoutContext = () => React.useContext(LayoutContext);

export const provideLayoutContext = Component => function LayoutContextProvider(props) {
  const [state, _setState] = React.useState({ ...defaultState });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  React.useEffect(() => {
    window.addEventListener('resize', () => setState({ viewport: getViewPort() }), true);
    return () => window.removeEventListener('resize', () => setState({ viewport: getViewPort() }), true);
  }, []);

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
