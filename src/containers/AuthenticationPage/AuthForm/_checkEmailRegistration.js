import { checkEmailRegistration } from '@/api/auth';

export default ({
  setState,
  disableAction,
  state: { form: { username: email } }
}) => () => {
  if (disableAction()) return;
  setState({ loading: true });
  checkEmailRegistration({ email })
    .catch(e => setState({
      loading: false,
      checkEmailRegistrationError: e,
    }))
    .then(rslts => {
      console.log(rslts);
      setState({ loading: false });
    });
};
