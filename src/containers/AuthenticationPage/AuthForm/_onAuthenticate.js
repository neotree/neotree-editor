export default (authType, {
  disableAction,
  state: { form: { username, password, password2 } }
}) => () => {
  if (!disableAction(authType)) return;
};
