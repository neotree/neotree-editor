import * as api from '@/api/users';

export default ({ setState }) => function getUsers() {
  setState({ loadingUsers: true });

  const done = (e, rslts = {}) => {
    setState({
      loadUsersError: e,
      ...rslts,
      usersInitialised: true,
      loadingUsers: false, 
    });
  };

  api.getUsers()
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
};
