import React from 'react';

export const LayoutContext = React.createContext(null);

export const useLayoutContext = () => React.useState(LayoutContext);

export const provideLayoutContext = Component => function LayoutContextProvider(props) {
  const [state, _setState] = React.useState({});
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
