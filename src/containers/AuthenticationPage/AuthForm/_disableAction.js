export default (authType, {
  state: { loading, emailRegistration, form: { email, password, password2 } }
}) => () => {
  let canSubmit = !loading && email;
  if (emailRegistration.userId) {
    const passwordConfirmed = password && (!emailRegistration.activated ? password === password2 : true);
    canSubmit = canSubmit && passwordConfirmed;
  }
  return canSubmit ? false : true;
};
