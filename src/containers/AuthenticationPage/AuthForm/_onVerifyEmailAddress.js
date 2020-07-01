export default ({
  setState,
  disableAction,
  state: { form: { username } }
}) => () => {
  if (disableAction()) return;
  setState({ loading: true });
  setTimeout(() => {
    setState({ loading: false, usernameVerified: true, });
  }, 1000);
};
