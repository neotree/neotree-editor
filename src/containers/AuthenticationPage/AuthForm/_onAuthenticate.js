/* global window */
import { authenticate } from '@/api/auth';

export default (authType, {
  disableAction,
  setState,
  state: { emailRegistration, form: { email, password, password2 } }
}) => () => {
  if (disableAction(authType)) return;

  setState({ loading: true });
  authenticate(authType, {
    id: emailRegistration.userId,
    username: email,
    password,
    password2
  })
    .catch(e => setState({ loading: false, authenticateError: e }))
    .then(() => { window.location.href = '/'; });
};
