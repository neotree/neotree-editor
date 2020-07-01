import React from 'react';

export const AuthPageContext = React.createContext(null);

export const useAuthPageContext = () => React.useContext(AuthPageContext);

export const provideAuthPageContext = Component => function AuthPageContextProvider(props) {
  const [state, _setState] = React.useState({
    form: {
      username: '',
      password: '',
      password2: '',
    },
  });

  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const setForm = s => _setState(prev => ({
    ...prev,
    form: { ...prev.form, ...typeof s === 'function' ? s(prev.form) : s }
  }));

  return (
    <AuthPageContext.Provider
      value={{
        state,
        setState,
        _setState,
        setForm,
      }}
    >
      <Component {...props} />
    </AuthPageContext.Provider>
  );
};
