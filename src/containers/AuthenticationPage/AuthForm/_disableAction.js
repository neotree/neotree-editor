export default (authType, {
  state: { loading, usernameVerified, form: { username, password, password2 } }
}) => () => {
  let canSubmit = !loading && username;
  if (usernameVerified) {
    const passwordConfirmed = password && (authType === 'sign-up' ? password === password2 : true);
    canSubmit = canSubmit && passwordConfirmed;
  }
  return canSubmit ? false : true;
};
