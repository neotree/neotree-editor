import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const ScriptsContext = React.createContext(null);

export const useScriptsContext = () => React.useContext(ScriptsContext);

export const provideScriptsContext = Component => function ScriptsContextProvider(props) {
  const router = useRouter();
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class ScriptsContextValue {
    state = state;

    _setState = _setState;

    router = router;

    defaults = defaults;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    deleteScripts = require('./_deleteScripts').default.bind(this);

    duplicateScripts = require('./_duplicateScripts').default.bind(this);

    getScripts = require('./_getScripts').default.bind(this);

    updateScripts = require('./_updateScripts').default.bind(this);
  })();

  React.useEffect(() => { value.getScripts(); }, []);

  return (
    <ScriptsContext.Provider
      value={value}
    >
      <Component {...props} />
    </ScriptsContext.Provider>
  );
};
