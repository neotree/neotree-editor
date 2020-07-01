export default (authType, {
  disableAction,
  state: { form: { email, password, password2 } }
}) => () => {
  if (!disableAction(authType)) return;
};
