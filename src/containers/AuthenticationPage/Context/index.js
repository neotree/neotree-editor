import React from 'react';
import _checkEmailRegistration from './_checkEmailRegistration';

export const AuthPageContext = React.createContext(null);

export const useAuthPageContext = () => React.useContext(AuthPageContext);

export const provideAuthPageContext = Component => function AuthPageContextProvider(props) {
  const [state, _setState] = React.useState({
    emailRegistration: {},
    form: {
      email: '',
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

  const { emailRegistration, form: { email } } = state;

  React.useEffect(() => {
    if (emailRegistration.email && (emailRegistration.email !== email)) {
      setState({ emailRegistration: {} });
      setForm({ password: '', password2: '' });
    }
  }, [email]);

  return (
    <AuthPageContext.Provider
      value={{
        state,
        setState,
        _setState,
        setForm,
        checkEmailRegistration: _checkEmailRegistration({ state, setState }),
      }}
    >
      <Component {...props} />
    </AuthPageContext.Provider>
  );
};
