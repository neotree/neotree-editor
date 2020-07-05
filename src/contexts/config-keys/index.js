import React from 'react';
import _getConfigKeys from './_getConfigKeys';
import _deleteConfigKeys from './_deleteConfigKeys';
import _updateConfigKeys from './_updateConfigKeys';
import _duplicateConfigKeys from './_duplicateConfigKeys';

export const ConfigKeysContext = React.createContext(null);

export const useConfigKeysContext = () => React.useContext(ConfigKeysContext);

export const provideConfigKeysContext = Component => function ConfigKeysContextProvider(props) {
  const [state, _setState] = React.useState({
    configKeys: [],
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const getConfigKeys = _getConfigKeys({ setState });
  const deleteConfigKeys = _deleteConfigKeys({ setState });
  const updateConfigKeys = _updateConfigKeys({ setState });
  const duplicateConfigKeys = _duplicateConfigKeys({ setState });

  React.useEffect(() => { getConfigKeys(); }, []);

  return (
    <ConfigKeysContext.Provider
      value={{
        state,
        setState,
        _setState,
        getConfigKeys,
        deleteConfigKeys,
        updateConfigKeys,
        duplicateConfigKeys,
      }}
    >
      <Component {...props} />
    </ConfigKeysContext.Provider>
  );
};
