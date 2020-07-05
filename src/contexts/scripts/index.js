import React from 'react';
import _getScripts from './_getScripts';
import _deleteScripts from './_deleteScripts';
import _updateScripts from './_updateScripts';
import _copyScripts from './_copyScripts';

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
  const deleteScripts = _deleteScripts({ setState });
  const updateScripts = _updateScripts({ setState });
  const copyScripts = _copyScripts({ setState });

  React.useEffect(() => { getScripts(); }, []);

  return (
    <ScriptsContext.Provider
      value={{
        state,
        setState,
        _setState,
        getScripts,
        deleteScripts,
        updateScripts,
        copyScripts,
      }}
    >
      <Component {...props} />
    </ScriptsContext.Provider>
  );
};
