import React from 'react';
import useContextValue from './ContextValue';

export const ConfigKeysContext = React.createContext(null);

export const useConfigKeysContext = () => React.useContext(ConfigKeysContext);

export const provideConfigKeysContext = Component => function ConfigKeysContextProvider(props) {
  const value = useContextValue();

  React.useEffect(() => { value.getConfigKeys(); }, []);

  return (
    <ConfigKeysContext.Provider
      value={value}
    >
      <Component {...props} />
    </ConfigKeysContext.Provider>
  );
};
