/* global window */
import { authenticate } from '@/api/auth';

export default (authType, {
  disableAction,
  setState,
  state: { emailRegistration, form: { email, password, password2 } }
}) => () => {
  if (disableAction(authType)) return;

  setState({ loading: true, authenticateError: null, });
  authenticate(authType, {
    id: emailRegistration.userId,
    username: email,
    password,
    password2
  })
    .then(() => { window.location.href = '/'; })
    .catch(e => {
      setState({ loading: false, authenticateError: e });
    });
};
