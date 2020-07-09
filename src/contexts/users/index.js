import React from 'react';
import _getUsers from './_getUsers';

export const UsersContext = React.createContext(null);

export const useUsersContext = () => React.useContext(UsersContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useUsersContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const provideUsersContext = Component => function UsersContextProvider(props) {
  const [state, _setState] = React.useState({
    users: [],
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const getUsers = _getUsers({ setState });

  React.useEffect(() => { getUsers(); }, []);

  return (
    <UsersContext.Provider
      value={{
        state,
        setState,
        _setState,
        getUsers
      }}
    >
      <Component {...props} />
    </UsersContext.Provider>
  );
};
