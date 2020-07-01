import { checkEmailRegistration } from '@/api/auth';

export default ({
  setState,
  state: { form: { email } }
}) => () => {
  setState({ loading: true });
  checkEmailRegistration({ email })
    .catch(e => setState({ loading: false, checkEmailRegistrationError: e, }))
    .then(emailRegistration => setState({ loading: false, emailRegistration }));
};
