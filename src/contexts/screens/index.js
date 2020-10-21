import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const ScreensContext = React.createContext(null);

export const useScreensContext = () => React.useContext(ScreensContext);

export const provideScreensContext = Component => function ScreensContextProvider(props) {
  const router = useRouter();
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class ScreensContextValue {
    state = state;

    _setState = _setState;

    router = router;

    defaults = defaults;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    deleteScreens = require('./_deleteScreens').default.bind(this);

    duplicateScreens = require('./_duplicateScreens').default.bind(this);

    getScreens = require('./_getScreens').default.bind(this);

    updateScreens = require('./_updateScreens').default.bind(this);
  })();

  const { scriptId } = value.router.match.params;

  React.useEffect(() => { value.getScreens({ scriptId }); }, [scriptId]);

  return (
    <ScreensContext.Provider
      value={value}
    >
      <Component {...props} />
    </ScreensContext.Provider>
  );
};
