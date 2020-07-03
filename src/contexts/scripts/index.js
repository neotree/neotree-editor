import React from 'react';
import _getScripts from './_getScripts';

export const ScriptsContext = React.createContext(null);

export const useScriptsContext = () => React.useContext(ScriptsContext);

export const provideScriptsContext = Component => function ScriptsContextProvider(props) {
  const [state, _setState] = React.useState({
    scripts: [],
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const getScripts = _getScripts({ setState });

  React.useEffect(() => { getScripts(); }, []);

  return (
    <ScriptsContext.Provider
      value={{
        state,
        setState,
        _setState,
        getScripts
      }}
    >
      <Component {...props} />
    </ScriptsContext.Provider>
  );
};
