import { checkEmailRegistration } from '@/api/auth';

export default ({
  setState,
  state: { form: { email } }
}) => () => {
  setState({ loading: true });
  checkEmailRegistration({ email })
    .then(emailRegistration => setState({ loading: false, emailRegistration }))
    .catch(e => setState({ loading: false, checkEmailRegistrationError: e, }));
};
