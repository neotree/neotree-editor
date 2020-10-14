import React from 'react';
import * as defaults from './_defaults';

export const ConfigKeysContext = React.createContext(null);

export const useConfigKeysContext = () => React.useContext(ConfigKeysContext);

export const provideConfigKeysContext = Component => function ConfigKeysContextProvider(props) {
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class ConfigKeysContextValue {
    state = state;

    _setState = _setState;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    deleteConfigKeys = require('./_deleteConfigKeys').default.bind(this);

    duplicateConfigKeys = require('./_duplicateConfigKeys').default.bind(this);

    getConfigKeys = require('./_getConfigKeys').default.bind(this);

    saveConfigKey = require('./_saveConfigKey').default.bind(this);

    updateConfigKeys = require('./_updateConfigKeys').default.bind(this);
  })();

  React.useEffect(() => { value.getConfigKeys(); }, []);

  return (
    <ConfigKeysContext.Provider
      value={value}
    >
      <Component {...props} />
    </ConfigKeysContext.Provider>
  );
};
