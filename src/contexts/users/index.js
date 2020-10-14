import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const UsersContext = React.createContext(null);

export const useUsersContext = () => React.useContext(UsersContext);

export const provideUsersContext = Component => function UsersContextProvider(props) {
  const router = useRouter();
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class UsersContextValue {
    state = state;

    _setState = _setState;

    router = router;

    defaults = defaults;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    getUsers = require('./_getUsers').default.bind(this);
  })();

  React.useEffect(() => { value.getUsers(); }, []);

  return (
    <UsersContext.Provider
      value={value}
    >
      <Component {...props} />
    </UsersContext.Provider>
  );
};
