export default (authType, {
  state: { loading, emailVerified, form: { email, password, password2 } }
}) => () => {
  let canSubmit = !loading && email;
  if (emailVerified) {
    const passwordConfirmed = password && (authType === 'sign-up' ? password === password2 : true);
    canSubmit = canSubmit && passwordConfirmed;
  }
  return canSubmit ? false : true;
};
